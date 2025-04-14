import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamCreateComponent } from './team-create.component';

describe('TeamCreateComponent', () => {
  let component: TeamCreateComponent;
  let fixture: ComponentFixture<TeamCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamCreateComponent]
    });
    fixture = TestBed.createComponent(TeamCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
