import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamUpdateComponent } from './team-update.component';

describe('TeamUpdateComponent', () => {
  let component: TeamUpdateComponent;
  let fixture: ComponentFixture<TeamUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamUpdateComponent]
    });
    fixture = TestBed.createComponent(TeamUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
