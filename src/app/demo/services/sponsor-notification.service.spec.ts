import { TestBed } from '@angular/core/testing';

import { SponsorNotificationService } from './sponsor-notification.service';

describe('SponsorNotificationService', () => {
  let service: SponsorNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SponsorNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
