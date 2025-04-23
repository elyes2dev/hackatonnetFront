import { TestBed } from '@angular/core/testing';

import { FacialAnalysisService } from './facial-analysis.service';

describe('FacialAnalysisService', () => {
  let service: FacialAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacialAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
