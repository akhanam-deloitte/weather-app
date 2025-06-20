import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiveDayForecastComponent } from './five-day-forecast.component';
import { WeatherService } from '../../services/weather.service';
import { UnitService } from '../../services/unit-service.service';
import { of, throwError, BehaviorSubject } from 'rxjs';

describe('FiveDayForecastComponent', () => {
  let component: FiveDayForecastComponent;
  let fixture: ComponentFixture<FiveDayForecastComponent>;
  let weatherServiceStub: Partial<WeatherService>;
  let unitService: UnitService;

  const mockForecast = [
    {
      date: '2025-06-20',
      day: {
        maxtemp_c: 30,
        mintemp_c: 20,
        condition: { text: 'Sunny', icon: 'icon.png' },
      },
    },
    {
      date: '2025-06-21',
      day: {
        maxtemp_c: 32,
        mintemp_c: 22,
        condition: { text: 'Cloudy', icon: 'icon2.png' },
      },
    },
  ];

  beforeEach(() => {
    weatherServiceStub = {
      getFiveDayForecastByCoords: (lat: number, lon: number) =>
        of({
          forecast: {
            forecastday: mockForecast,
          },
        }),
    };

    unitService = new UnitService();
    (unitService as any).unitSubject = new BehaviorSubject<'C' | 'F'>('C');
    unitService.unit$ = (unitService as any).unitSubject.asObservable();

    TestBed.configureTestingModule({
      declarations: [FiveDayForecastComponent],
      providers: [
        { provide: WeatherService, useValue: weatherServiceStub },
        { provide: UnitService, useValue: unitService },
      ],
    });

    fixture = TestBed.createComponent(FiveDayForecastComponent);
    component = fixture.componentInstance;
  });

  function mockGeolocationSuccess() {
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
  }

  it('should fetch and display 5-day forecast in Celsius', () => {
    mockGeolocationSuccess();
    fixture.detectChanges();
    expect(component.forecast.length).toBe(2);
    expect(component.displayTemp(30)).toBe('30°C');
    expect(component.displayTemp(20)).toBe('20°C');
  });

  it('should display forecast in Fahrenheit after toggle', () => {
    (unitService as any).unitSubject.next('F');
    mockGeolocationSuccess();
    fixture.detectChanges();
    expect(component.displayTemp(30)).toBe('86.0°F');
    expect(component.displayTemp(20)).toBe('68.0°F');
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
    weatherServiceStub.getFiveDayForecastByCoords = () => throwError(() => new Error('API error'));
    TestBed.overrideProvider(WeatherService, { useValue: weatherServiceStub });
    mockGeolocationSuccess();
    fixture = TestBed.createComponent(FiveDayForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.error).toBe('Failed to fetch 5-day forecast');
  });
});
