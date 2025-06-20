import { Component, OnInit, OnDestroy } from '@angular/core';
import { WeatherService } from '../../services/weather.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UnitService } from '../../services/unit-service.service';
import { Subscription } from 'rxjs';

interface DayForecast {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    condition: { text: string; icon: string };
  };
}

@Component({
  selector: 'app-five-day-forecast',
  templateUrl: './five-day-forecast.component.html',
  styleUrl: './five-day-forecast.component.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  providers: [WeatherService],
})
export class FiveDayForecastComponent implements OnInit, OnDestroy {
  forecast: DayForecast[] = [];
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
            .getFiveDayForecastByCoords(
              position.coords.latitude,
              position.coords.longitude
            )
            .subscribe({
              next: (data: any) => {
                this.forecast = data.forecast.forecastday;
                localStorage.setItem('fiveDayForecast', JSON.stringify(this.forecast));
              },
              error: () => (this.error = 'Failed to fetch 5-day forecast'),
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