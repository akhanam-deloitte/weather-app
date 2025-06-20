import { Component, EventEmitter, Output } from '@angular/core';
import { UnitService } from '../../services/unit-service.service';

@Component({
  selector: 'app-unit-conversion-toggle',
  standalone: true,
  template: `
    <button (click)="toggleUnit()">
      Switch to {{ unit === 'C' ? 'Fahrenheit' : 'Celsius' }}
    </button>
  `,
})
export class UnitConversionToggleComponent {
  unit: "C" | "F";
  @Output() unitChanged = new EventEmitter<string>();

  constructor(private unitService: UnitService) {
    this.unit = this.unitService.getUnit();
    this.unitService.unit$.subscribe((u) => (this.unit = u));
  }

  toggleUnit() {
    const newUnit = this.unit === 'C' ? 'F' : 'C';
    this.unitService.setUnit(newUnit);
  }
}
