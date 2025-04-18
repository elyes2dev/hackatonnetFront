import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HackathonCategorizationAnalyticsComponent } from './hackathon-categorization-analytics.component';

describe('HackathonCategorizationAnalyticsComponent', () => {
  let component: HackathonCategorizationAnalyticsComponent;
  let fixture: ComponentFixture<HackathonCategorizationAnalyticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HackathonCategorizationAnalyticsComponent]
    });
    fixture = TestBed.createComponent(HackathonCategorizationAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
