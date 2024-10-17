import { TestBed } from '@angular/core/testing';

import { PremiosService } from './premios.service';

describe('PremiosService', () => {
  let service: PremiosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PremiosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
