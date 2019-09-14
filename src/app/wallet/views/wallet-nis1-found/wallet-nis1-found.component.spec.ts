import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletNis1FoundComponent } from './wallet-nis1-found.component';

describe('WalletNis1FoundComponent', () => {
  let component: WalletNis1FoundComponent;
  let fixture: ComponentFixture<WalletNis1FoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletNis1FoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletNis1FoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
