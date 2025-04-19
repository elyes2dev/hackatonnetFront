import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveTeamComponent } from './leave-team.component';

describe('LeaveTeamComponent', () => {
  let component: LeaveTeamComponent;
  let fixture: ComponentFixture<LeaveTeamComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeaveTeamComponent]
    });
    fixture = TestBed.createComponent(LeaveTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
