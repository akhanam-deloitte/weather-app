import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { CurrentWeatherComponent } from './components/current-weather/current-weather.component';
import { HourlyForecastComponent } from './components/hourly-forecast/hourly-forecast.component';
import { FiveDayForecastComponent } from './components/five-day-forecast/five-day-forecast.component';
import { CitySearchComponent } from './components/city-search/city-search.component';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', component: CurrentWeatherComponent },
            { path: 'hourly', component: HourlyForecastComponent },
            { path: 'fiveday', component: FiveDayForecastComponent },
            { path: 'search', component: CitySearchComponent },
        ]
    }
];
