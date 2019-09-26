import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteWalletConfirmComponent } from './delete-wallet-confirm.component';

describe('DeleteWalletConfirmComponent', () => {
  let component: DeleteWalletConfirmComponent;
  let fixture: ComponentFixture<DeleteWalletConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteWalletConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteWalletConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
