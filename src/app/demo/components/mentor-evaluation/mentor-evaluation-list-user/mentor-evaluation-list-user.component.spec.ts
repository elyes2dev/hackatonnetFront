import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorEvaluationListUserComponent } from './mentor-evaluation-list-user.component';

describe('MentorEvaluationListUserComponent', () => {
  let component: MentorEvaluationListUserComponent;
  let fixture: ComponentFixture<MentorEvaluationListUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MentorEvaluationListUserComponent]
    });
    fixture = TestBed.createComponent(MentorEvaluationListUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
