import { TestBed } from '@angular/core/testing';

import { DataReloadService } from './data-reload.service';

describe('DataReloadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataReloadService = TestBed.get(DataReloadService);
    expect(service).toBeTruthy();
  });
});
