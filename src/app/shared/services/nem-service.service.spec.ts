import { TestBed } from '@angular/core/testing';

import { NemServiceService } from './nem-service.service';

describe('NemServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NemServiceService = TestBed.get(NemServiceService);
    expect(service).toBeTruthy();
  });
});
