import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const isBrowser = typeof window !== 'undefined' && !!window.localStorage;

@Injectable({ providedIn: 'root' })
export class UnitService {
  private unitSubject = new BehaviorSubject<'C' | 'F'>('C');
  unit$ = this.unitSubject.asObservable();

  constructor() {
    if (isBrowser) {
      const stored = localStorage.getItem('tempUnit');
      if (stored === 'C' || stored === 'F') {
        this.unitSubject.next(stored);
      }
    }
  }

  setUnit(unit: 'C' | 'F') {
    if (isBrowser) {
      localStorage.setItem('tempUnit', unit);
    }
    this.unitSubject.next(unit);
  }

  getUnit(): 'C' | 'F' {
    return this.unitSubject.value;
  }
}
