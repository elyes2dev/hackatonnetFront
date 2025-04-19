import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSubmissionComponent } from './team-submission.component';

describe('TeamSubmissionComponent', () => {
  let component: TeamSubmissionComponent;
  let fixture: ComponentFixture<TeamSubmissionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamSubmissionComponent]
    });
    fixture = TestBed.createComponent(TeamSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
