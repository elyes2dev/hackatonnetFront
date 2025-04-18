import { TestBed } from '@angular/core/testing';

import { CategorizationService } from './categorization.service';

describe('CategorizationService', () => {
  let service: CategorizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategorizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
