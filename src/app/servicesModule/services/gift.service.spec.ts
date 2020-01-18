import { TestBed } from '@angular/core/testing';

import { GiftService } from './gift.service';

describe('GiftService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GiftService = TestBed.get(GiftService);
    expect(service).toBeTruthy();
  });
});
