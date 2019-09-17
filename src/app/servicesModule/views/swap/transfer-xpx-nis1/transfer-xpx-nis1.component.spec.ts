import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferXpxNis1Component } from './transfer-xpx-nis1.component';

describe('TransferXpxNis1Component', () => {
  let component: TransferXpxNis1Component;
  let fixture: ComponentFixture<TransferXpxNis1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferXpxNis1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferXpxNis1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
