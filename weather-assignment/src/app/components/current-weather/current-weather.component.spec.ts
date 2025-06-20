import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentWeatherComponent } from './current-weather.component';
import { WeatherService } from '../../services/weather.service';
import { UnitService } from '../../services/unit-service.service';
import { of, throwError, BehaviorSubject } from 'rxjs';

describe('CurrentWeatherComponent', () => {
  let component: CurrentWeatherComponent;
  let fixture: ComponentFixture<CurrentWeatherComponent>;
  let weatherServiceStub: Partial<WeatherService>;
  let unitService: UnitService;

  beforeEach(() => {
    weatherServiceStub = {
      getWeatherByCoords: (lat: number, lon: number) =>
        of({
          current: {
            temp_c: 25,
            condition: { text: 'Sunny', icon: 'icon.png' },
          },
        }),
    };

    unitService = new UnitService();
    (unitService as any).unitSubject = new BehaviorSubject<'C' | 'F'>('C');
    unitService.unit$ = (unitService as any).unitSubject.asObservable();

    TestBed.configureTestingModule({
      declarations: [CurrentWeatherComponent],
      providers: [
        { provide: WeatherService, useValue: weatherServiceStub },
        { provide: UnitService, useValue: unitService },
      ],
    });

    fixture = TestBed.createComponent(CurrentWeatherComponent);
    component = fixture.componentInstance;
  });

  it('should fetch and display weather in Celsius', () => {
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((success) => {
      success({
        coords: {
          latitude: 0,
          longitude: 0,
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });
    fixture.detectChanges();
    expect(component.temperature).toBe(25);
    expect(component.displayTemp(25)).toBe('25°C');
  });

  it('should display weather in Fahrenheit after toggle', () => {
    (unitService as any).unitSubject.next('F');
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((success) => {
      success({
        coords: {
          latitude: 0,
          longitude: 0,
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });
    fixture.detectChanges();
    expect(component.displayTemp(25)).toBe('77.0°F');
  });

  it('should handle geolocation permission denied', () => {
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((success, error) => {
      error &&
        error({
          code: 1,
          message: 'User denied Geolocation',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError);
    });
    fixture.detectChanges();
    expect(component.error).toBe('Geolocation permission denied');
  });

  it('should handle API error', () => {
    weatherServiceStub.getWeatherByCoords = () => throwError(() => new Error('API error'));
    TestBed.overrideProvider(WeatherService, { useValue: weatherServiceStub });
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((success) => {
      success({
        coords: {
          latitude: 0,
          longitude: 0,
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });
    fixture = TestBed.createComponent(CurrentWeatherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.error).toBe('Failed to fetch weather data');
  });
});
