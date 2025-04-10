import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorEvaluationFormAdminComponent } from './mentor-evaluation-form-admin.component';

describe('MentorEvaluationFormAdminComponent', () => {
  let component: MentorEvaluationFormAdminComponent;
  let fixture: ComponentFixture<MentorEvaluationFormAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MentorEvaluationFormAdminComponent]
    });
    fixture = TestBed.createComponent(MentorEvaluationFormAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
