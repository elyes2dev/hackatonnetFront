import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HackathonAnalyticsComponent } from './hackathon-analytics.component';

describe('HackathonAnalyticsComponent', () => {
  let component: HackathonAnalyticsComponent;
  let fixture: ComponentFixture<HackathonAnalyticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HackathonAnalyticsComponent]
    });
    fixture = TestBed.createComponent(HackathonAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
