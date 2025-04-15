import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingHackathonListComponent } from './landing-hackathon-list.component';

describe('LandingHackathonListComponent', () => {
  let component: LandingHackathonListComponent;
  let fixture: ComponentFixture<LandingHackathonListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LandingHackathonListComponent]
    });
    fixture = TestBed.createComponent(LandingHackathonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
