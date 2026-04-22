import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaPublica } from './consulta-publica';

describe('ConsultaPublica', () => {
  let component: ConsultaPublica;
  let fixture: ComponentFixture<ConsultaPublica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaPublica],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaPublica);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
