import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CitySearchComponent } from './city-search.component';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../../services/weather.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { UnitService } from '../../services/unit-service.service';

describe('CitySearchComponent', () => {
  let component: CitySearchComponent;
  let fixture: ComponentFixture<CitySearchComponent>;
  let weatherServiceStub: Partial<WeatherService>;
  let unitService: UnitService;

  beforeEach(() => {
    weatherServiceStub = {
      getWeatherByCity: (city: string) =>
        city === 'ValidCity'
          ? of({
            location: { name: 'ValidCity', country: 'Country' },
            current: { temp_c: 20, condition: { text: 'Clear', icon: 'icon.png' } },
          })
          : throwError({ error: { error: { message: 'No matching location found.' } } }),
    };

    unitService = new UnitService();
    (unitService as any).unitSubject = new BehaviorSubject<'C' | 'F'>('C');
    unitService.unit$ = (unitService as any).unitSubject.asObservable();

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [CitySearchComponent],
      providers: [
        { provide: WeatherService, useValue: weatherServiceStub },
        { provide: UnitService, useValue: unitService },
      ],
    });

    fixture = TestBed.createComponent(CitySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display weather for a valid city in Celsius', () => {
    component.city = 'ValidCity';
    component.search();
    fixture.detectChanges();
    expect(component.weather.location.name).toBe('ValidCity');
    expect(component.displayTemp(20)).toBe('20°C');
  });

  it('should display weather for a valid city in Fahrenheit after toggle', () => {
    (unitService as any).unitSubject.next('F');
    component.city = 'ValidCity';
    component.search();
    fixture.detectChanges();
    expect(component.displayTemp(20)).toBe('68.0°F');
  });

  it('should show error for invalid city', () => {
    component.city = 'InvalidCity';
    component.search();
    fixture.detectChanges();
    expect(component.weather).toBeNull();
    expect(component.error).toContain('No matching location found');
  });

  it('should show error if city is empty', () => {
    component.city = '';
    component.search();
    fixture.detectChanges();
    expect(component.error).toBe('Please enter a city name.');
  });
});