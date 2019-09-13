import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferTypeBondedComponent } from './transfer-type-bonded.component';

describe('TransferTypeBondedComponent', () => {
  let component: TransferTypeBondedComponent;
  let fixture: ComponentFixture<TransferTypeBondedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferTypeBondedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferTypeBondedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
