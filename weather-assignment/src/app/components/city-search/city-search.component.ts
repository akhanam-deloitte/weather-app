import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../../services/weather.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UnitService } from '../../services/unit-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-city-search',
  templateUrl: './city-search.component.html',
  styleUrl: './city-search.component.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
})
export class CitySearchComponent {
  city = '';
  weather: any = null;
  error: string | null = null;
  loading = false;
  unit: 'C' | 'F' = 'C';
  private unitSub?: Subscription;

  constructor(
    private weatherService: WeatherService,
    private unitService: UnitService
  ) {
    this.unitSub = this.unitService.unit$.subscribe((u) => (this.unit = u));
  }

  ngOnDestroy() {
    this.unitSub?.unsubscribe();
  }

  search() {
    this.error = null;
    this.weather = null;
    if (!this.city.trim()) {
      this.error = 'Please enter a city name.';
      return;
    }
    this.loading = true;
    this.weatherService.getWeatherByCity(this.city).subscribe({
      next: (data: any) => {
        this.weather = data;
        localStorage.setItem('lastCityWeather', JSON.stringify(data));
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error?.message || 'City not found or API error.';
        this.loading = false;
      },
    });
  }

  displayTemp(tempC: number): string {
    return this.unit === 'C'
      ? `${tempC}°C`
      : `${((tempC * 9) / 5 + 32).toFixed(1)}°F`;
  }
}