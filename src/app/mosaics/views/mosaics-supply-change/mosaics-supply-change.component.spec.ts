import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MosaicsSupplyChangeComponent } from './mosaics-supply-change.component';

describe('MosaicsSupplyChangeComponent', () => {
  let component: MosaicsSupplyChangeComponent;
  let fixture: ComponentFixture<MosaicsSupplyChangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MosaicsSupplyChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MosaicsSupplyChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
