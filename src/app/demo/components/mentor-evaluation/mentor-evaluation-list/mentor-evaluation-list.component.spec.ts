import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorEvaluationListComponent } from './mentor-evaluation-list.component';

describe('MentorEvaluationListComponent', () => {
  let component: MentorEvaluationListComponent;
  let fixture: ComponentFixture<MentorEvaluationListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MentorEvaluationListComponent]
    });
    fixture = TestBed.createComponent(MentorEvaluationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
