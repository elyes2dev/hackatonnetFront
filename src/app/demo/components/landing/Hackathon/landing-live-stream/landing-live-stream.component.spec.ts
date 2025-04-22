import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingLiveStreamComponent } from './landing-live-stream.component';

describe('LandingLiveStreamComponent', () => {
  let component: LandingLiveStreamComponent;
  let fixture: ComponentFixture<LandingLiveStreamComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LandingLiveStreamComponent]
    });
    fixture = TestBed.createComponent(LandingLiveStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
