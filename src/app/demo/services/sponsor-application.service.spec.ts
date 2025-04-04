import { TestBed } from '@angular/core/testing';

import { SponsorApplicationService } from './sponsor-application.service';

describe('SponsorApplicationService', () => {
  let service: SponsorApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SponsorApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
