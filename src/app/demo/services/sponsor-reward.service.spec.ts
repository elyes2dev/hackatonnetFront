import { TestBed } from '@angular/core/testing';

import { SponsorRewardService } from './sponsor-reward.service';

describe('SponsorRewardService', () => {
  let service: SponsorRewardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SponsorRewardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
