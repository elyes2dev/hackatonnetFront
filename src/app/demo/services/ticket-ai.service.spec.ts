import { TestBed } from '@angular/core/testing';

import { TicketAIService } from './ticket-ai.service';

describe('TicketAIService', () => {
  let service: TicketAIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketAIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
