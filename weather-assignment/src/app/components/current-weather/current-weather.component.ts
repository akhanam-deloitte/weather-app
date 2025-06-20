import { Component, OnInit, OnDestroy } from '@angular/core';
import { WeatherService } from '../../services/weather.service';
import { UnitService } from '../../services/unit-service.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-current-weather',
  templateUrl: './current-weather.component.html',
  styleUrl: './current-weather.component.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  providers: [WeatherService],
})
export class CurrentWeatherComponent implements OnInit, OnDestroy {
  temperature?: number;
  description?: string;
  iconUrl?: string;
  error?: string;
  unit: 'C' | 'F' = 'C';
  private unitSub?: Subscription;

  constructor(
    private weatherService: WeatherService,
    private unitService: UnitService
  ) { }

  ngOnInit() {
    this.unitSub = this.unitService.unit$.subscribe((u) => (this.unit = u));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.weatherService
            .getWeatherByCoords(
              position.coords.latitude,
              position.coords.longitude
            )
            .subscribe({
              next: (data: any) => {
                this.temperature = data.current.temp_c;
                this.description = data.current.condition.text;
                this.iconUrl = data.current.condition.icon;
              },
              error: () => (this.error = 'Failed to fetch weather data'),
            });
        },
        () => (this.error = 'Geolocation permission denied')
      );
    } else {
      this.error = 'Geolocation not supported';
    }
  }

  ngOnDestroy() {
    this.unitSub?.unsubscribe();
  }

  displayTemp(tempC: number | undefined): string {
    if (tempC === undefined) return '';
    return this.unit === 'C'
      ? `${tempC}°C`
      : `${((tempC * 9) / 5 + 32).toFixed(1)}°F`;
  }
}