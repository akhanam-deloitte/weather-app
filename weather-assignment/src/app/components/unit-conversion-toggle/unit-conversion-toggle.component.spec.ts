import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitConversionToggleComponent } from './unit-conversion-toggle.component';
import { UnitService } from '../../services/unit-service.service';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('UnitConversionToggleComponent', () => {
  let component: UnitConversionToggleComponent;
  let fixture: ComponentFixture<UnitConversionToggleComponent>;
  let unitService: UnitService;

  beforeEach(() => {
    unitService = new UnitService();
    (unitService as any).unitSubject = new BehaviorSubject<'C' | 'F'>('C');
    unitService.unit$ = (unitService as any).unitSubject.asObservable();

    TestBed.configureTestingModule({
      imports: [UnitConversionToggleComponent],
      providers: [{ provide: UnitService, useValue: unitService }],
    });

    fixture = TestBed.createComponent(UnitConversionToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display "Switch to Fahrenheit" when unit is Celsius', () => {
    component.unit = 'C';
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.textContent).toContain('Switch to Fahrenheit');
  });

  it('should display "Switch to Celsius" when unit is Fahrenheit', () => {
    (unitService as any).unitSubject.next('F');
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.textContent).toContain('Switch to Celsius');
  });

  it('should toggle unit and update service when clicked', () => {
    spyOn(unitService, 'setUnit').and.callThrough();
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();
    fixture.detectChanges();
    expect(unitService.setUnit).toHaveBeenCalledWith('F');
    expect(component.unit).toBe('F');
  });

  it('should toggle back to Celsius when clicked again', () => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();
    fixture.detectChanges();
    button.click();
    fixture.detectChanges();
    expect(component.unit).toBe('C');
  });
});
