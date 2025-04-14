import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingProjectEvaluationComponent } from './landing-project-evaluation.component';

describe('LandingProjectEvaluationComponent', () => {
  let component: LandingProjectEvaluationComponent;
  let fixture: ComponentFixture<LandingProjectEvaluationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LandingProjectEvaluationComponent]
    });
    fixture = TestBed.createComponent(LandingProjectEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
