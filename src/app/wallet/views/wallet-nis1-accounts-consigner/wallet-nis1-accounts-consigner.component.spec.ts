import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletNis1AccountsConsignerComponent } from './wallet-nis1-accounts-consigner.component';

describe('WalletNis1AccountsConsignerComponent', () => {
  let component: WalletNis1AccountsConsignerComponent;
  let fixture: ComponentFixture<WalletNis1AccountsConsignerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletNis1AccountsConsignerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletNis1AccountsConsignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
