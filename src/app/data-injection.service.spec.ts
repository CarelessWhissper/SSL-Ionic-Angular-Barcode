import { TestBed } from '@angular/core/testing';

import { DataInjectionService } from './data-injection.service';

describe('DataInjectionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataInjectionService = TestBed.get(DataInjectionService);
    expect(service).toBeTruthy();
  });
});
