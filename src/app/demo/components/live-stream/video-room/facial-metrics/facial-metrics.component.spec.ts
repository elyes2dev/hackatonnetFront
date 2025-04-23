import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacialMetricsComponent } from './facial-metrics.component';

describe('FacialMetricsComponent', () => {
  let component: FacialMetricsComponent;
  let fixture: ComponentFixture<FacialMetricsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FacialMetricsComponent]
    });
    fixture = TestBed.createComponent(FacialMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
