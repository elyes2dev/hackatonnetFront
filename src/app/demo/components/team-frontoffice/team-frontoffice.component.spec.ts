import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamFrontofficeComponent } from './team-frontoffice.component';

describe('TeamFrontofficeComponent', () => {
  let component: TeamFrontofficeComponent;
  let fixture: ComponentFixture<TeamFrontofficeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamFrontofficeComponent]
    });
    fixture = TestBed.createComponent(TeamFrontofficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
