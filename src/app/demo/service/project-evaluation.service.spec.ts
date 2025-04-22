import { TestBed } from '@angular/core/testing';

import { ProjectEvaluationService } from './project-evaluation.service';

describe('ProjectEvaluationService', () => {
  let service: ProjectEvaluationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectEvaluationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
