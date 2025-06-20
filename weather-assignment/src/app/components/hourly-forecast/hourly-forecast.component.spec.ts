import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HourlyForecastComponent } from './hourly-forecast.component';
import { WeatherService } from '../../services/weather.service';
import { UnitService } from '../../services/unit-service.service';
import { of, throwError, BehaviorSubject } from 'rxjs';

describe('HourlyForecastComponent', () => {
  let component: HourlyForecastComponent;
  let fixture: ComponentFixture<HourlyForecastComponent>;
  let weatherServiceStub: Partial<WeatherService>;
  let unitService: UnitService;

  const mockHourly = [
    {
      time: '2025-06-20 00:00',
      temp_c: 25,
      condition: { text: 'Clear', icon: 'icon.png' },
    },
    {
      time: '2025-06-20 01:00',
      temp_c: 24,
      condition: { text: 'Cloudy', icon: 'icon2.png' },
    },
  ];

  beforeEach(() => {
    weatherServiceStub = {
      getHourlyForecastByCoords: (lat: number, lon: number) =>
        of({
          forecast: {
            forecastday: [
              {
                hour: mockHourly,
              },
            ],
          },
        }),
    };

    unitService = new UnitService();
    (unitService as any).unitSubject = new BehaviorSubject<'C' | 'F'>('C');
    unitService.unit$ = (unitService as any).unitSubject.asObservable();

    TestBed.configureTestingModule({
      declarations: [HourlyForecastComponent],
      providers: [
        { provide: WeatherService, useValue: weatherServiceStub },
        { provide: UnitService, useValue: unitService },
      ],
    });

    fixture = TestBed.createComponent(HourlyForecastComponent);
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

  it('should fetch and display hourly forecast in Celsius', () => {
    mockGeolocationSuccess();
    fixture.detectChanges();
    expect(component.hourly.length).toBe(2);
    expect(component.displayTemp(25)).toBe('25°C');
    expect(component.displayTemp(24)).toBe('24°C');
  });

  it('should display hourly forecast in Fahrenheit after toggle', () => {
    (unitService as any).unitSubject.next('F');
    mockGeolocationSuccess();
    fixture.detectChanges();
    expect(component.displayTemp(25)).toBe('77.0°F');
    expect(component.displayTemp(24)).toBe('75.2°F');
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
    weatherServiceStub.getHourlyForecastByCoords = () => throwError(() => new Error('API error'));
    TestBed.overrideProvider(WeatherService, { useValue: weatherServiceStub });
    mockGeolocationSuccess();
    fixture = TestBed.createComponent(HourlyForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.error).toBe('Failed to fetch hourly forecast');
  });
});
