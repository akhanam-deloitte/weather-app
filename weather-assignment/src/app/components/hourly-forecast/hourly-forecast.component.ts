import { Component, OnInit, OnDestroy } from '@angular/core';
import { WeatherService } from '../../services/weather.service';
import { UnitService } from '../../services/unit-service.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

interface HourlyWeather {
  time: string;
  temp_c: number;
  condition: { text: string; icon: string };
}

@Component({
  selector: 'app-hourly-forecast',
  templateUrl: './hourly-forecast.component.html',
  styleUrl: './hourly-forecast.component.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  providers: [WeatherService],
})
export class HourlyForecastComponent implements OnInit, OnDestroy {
  hourly: HourlyWeather[] = [];
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
            .getHourlyForecastByCoords(
              position.coords.latitude,
              position.coords.longitude
            )
            .subscribe({
              next: (data: any) => {
                this.hourly = data.forecast.forecastday[0].hour;
                localStorage.setItem('hourlyForecast', JSON.stringify(this.hourly));
              },
              error: () => (this.error = 'Failed to fetch hourly forecast'),
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

  displayTemp(tempC: number): string {
    return this.unit === 'C'
      ? `${tempC}°C`
      : `${((tempC * 9) / 5 + 32).toFixed(1)}°F`;
  }
}