import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferXpxComponent } from './transfer-xpx.component';

describe('TransferXpxComponent', () => {
  let component: TransferXpxComponent;
  let fixture: ComponentFixture<TransferXpxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferXpxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferXpxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
