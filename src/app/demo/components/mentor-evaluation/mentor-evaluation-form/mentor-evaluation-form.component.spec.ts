import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorEvaluationFormComponent } from './mentor-evaluation-form.component';

describe('MentorEvaluationFormComponent', () => {
  let component: MentorEvaluationFormComponent;
  let fixture: ComponentFixture<MentorEvaluationFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MentorEvaluationFormComponent]
    });
    fixture = TestBed.createComponent(MentorEvaluationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
