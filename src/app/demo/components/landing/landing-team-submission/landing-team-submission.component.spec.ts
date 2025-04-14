import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingTeamSubmissionComponent } from './landing-team-submission.component';

describe('LandingTeamSubmissionComponent', () => {
  let component: LandingTeamSubmissionComponent;
  let fixture: ComponentFixture<LandingTeamSubmissionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LandingTeamSubmissionComponent]
    });
    fixture = TestBed.createComponent(LandingTeamSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
