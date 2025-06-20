import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UnitConversionToggleComponent } from '../components/unit-conversion-toggle/unit-conversion-toggle.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule,
    UnitConversionToggleComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  unit: "C" | "F" = "C";

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.unit = (localStorage.getItem('tempUnit') as "C" | "F") || "C";
    }
  }

  onUnitChanged(unit: "C" | "F") {
    this.unit = unit;
  }
}
