import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingHackathonDetailsComponent } from './landing-hackathon-details.component';

describe('LandingHackathonDetailsComponent', () => {
  let component: LandingHackathonDetailsComponent;
  let fixture: ComponentFixture<LandingHackathonDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LandingHackathonDetailsComponent]
    });
    fixture = TestBed.createComponent(LandingHackathonDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
