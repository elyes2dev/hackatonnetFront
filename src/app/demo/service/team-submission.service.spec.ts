import { TestBed } from '@angular/core/testing';

import { TeamSubmissionService } from './team-submission.service';

describe('TeamSubmissionService', () => {
  let service: TeamSubmissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamSubmissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
