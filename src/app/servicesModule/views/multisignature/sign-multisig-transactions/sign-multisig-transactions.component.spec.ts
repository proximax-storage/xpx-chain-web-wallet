import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignMultisigTransactionsComponent } from './sign-multisig-transactions.component';

describe('SignMultisigTransactionsComponent', () => {
  let component: SignMultisigTransactionsComponent;
  let fixture: ComponentFixture<SignMultisigTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignMultisigTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignMultisigTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
