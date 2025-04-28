/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamFrontofficeComponent } from './team-frontoffice.component';

describe('TeamFrontofficeComponent', () => {
  let component: TeamFrontofficeComponent;
  let fixture: ComponentFixture<TeamFrontofficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeamFrontofficeComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamFrontofficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
