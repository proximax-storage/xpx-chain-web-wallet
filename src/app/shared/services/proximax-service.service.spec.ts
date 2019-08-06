import { TestBed } from '@angular/core/testing';

import { ProximaxServiceService } from './proximax-service.service';

describe('ProximaxServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProximaxServiceService = TestBed.get(ProximaxServiceService);
    expect(service).toBeTruthy();
  });
});
