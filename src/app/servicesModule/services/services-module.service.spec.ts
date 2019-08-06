import { TestBed } from '@angular/core/testing';

import { ServicesModuleService } from './services-module.service';

describe('ServicesModuleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServicesModuleService = TestBed.get(ServicesModuleService);
    expect(service).toBeTruthy();
  });
});
