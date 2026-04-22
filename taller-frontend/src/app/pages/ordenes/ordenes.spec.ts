import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ordenes } from './ordenes';

describe('Ordenes', () => {
  let component: Ordenes;
  let fixture: ComponentFixture<Ordenes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ordenes],
    }).compileComponents();

    fixture = TestBed.createComponent(Ordenes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
