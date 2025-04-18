import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HackathonInsightsComponent } from './hackathon-insights.component';

describe('HackathonInsightsComponent', () => {
  let component: HackathonInsightsComponent;
  let fixture: ComponentFixture<HackathonInsightsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HackathonInsightsComponent]
    });
    fixture = TestBed.createComponent(HackathonInsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
