import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamJoinComponent } from './team-join.component';

describe('TeamJoinComponent', () => {
  let component: TeamJoinComponent;
  let fixture: ComponentFixture<TeamJoinComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamJoinComponent]
    });
    fixture = TestBed.createComponent(TeamJoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
