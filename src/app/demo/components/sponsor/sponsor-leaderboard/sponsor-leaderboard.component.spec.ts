import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorLeaderboardComponent } from './sponsor-leaderboard.component';

describe('SponsorLeaderboardComponent', () => {
  let component: SponsorLeaderboardComponent;
  let fixture: ComponentFixture<SponsorLeaderboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SponsorLeaderboardComponent]
    });
    fixture = TestBed.createComponent(SponsorLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
