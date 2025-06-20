import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private apiKey = '43ca6933ccf24f09a30180511251906';
  private apiUrl = 'https://api.weatherapi.com/v1/current.json';
  constructor(private http: HttpClient) { }

  getWeatherByCoords(lat: number, lon: number) {
    return this.http.get(
      `${this.apiUrl}?key=${this.apiKey}&q=${lat},${lon}&aqi=no`
    );
  }

  getHourlyForecastByCoords(lat: number, lon: number) {
    return this.http.get(
      `${this.apiUrl.replace('current.json', 'forecast.json')}?key=${this.apiKey}&q=${lat},${lon}&hours=24`
    );
  }

  getFiveDayForecastByCoords(lat: number, lon: number) {
    return this.http.get(
      `https://api.weatherapi.com/v1/forecast.json?key=${this.apiKey}&q=${lat},${lon}&days=5`
    );
  }

  getWeatherByCity(city: string) {
    return this.http.get(
      `${this.apiUrl}?key=${this.apiKey}&q=${encodeURIComponent(city)}&aqi=no`
    );
  }
}

