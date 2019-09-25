import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapTransactionsComponent } from './swap-transactions.component';

describe('SwapTransactionsComponent', () => {
  let component: SwapTransactionsComponent;
  let fixture: ComponentFixture<SwapTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwapTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwapTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
