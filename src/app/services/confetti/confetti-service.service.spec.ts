import { TestBed } from '@angular/core/testing';

import { ConfettiServiceService } from './confetti-service.service';

describe('ConfettiServiceService', () => {
  let service: ConfettiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfettiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
