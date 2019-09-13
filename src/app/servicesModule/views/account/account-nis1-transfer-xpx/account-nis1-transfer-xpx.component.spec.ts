import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountNis1TransferXpxComponent } from './account-nis1-transfer-xpx.component';

describe('AccountNis1TransferXpxComponent', () => {
  let component: AccountNis1TransferXpxComponent;
  let fixture: ComponentFixture<AccountNis1TransferXpxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountNis1TransferXpxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountNis1TransferXpxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
