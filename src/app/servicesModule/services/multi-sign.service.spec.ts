import { TestBed } from '@angular/core/testing';

import { MultiSignService } from './multi-sign.service';

describe('MultiSignService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MultiSignService = TestBed.get(MultiSignService);
    expect(service).toBeTruthy();
  });
});
