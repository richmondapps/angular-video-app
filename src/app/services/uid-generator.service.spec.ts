import { TestBed } from '@angular/core/testing';

import { UidGeneratorService } from './uid-generator.service';

describe('UidGeneratorService', () => {
  let service: UidGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UidGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
