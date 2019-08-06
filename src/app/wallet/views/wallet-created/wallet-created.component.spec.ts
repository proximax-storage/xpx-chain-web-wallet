import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletCreatedComponent } from './wallet-created.component';

describe('WalletCreatedComponent', () => {
  let component: WalletCreatedComponent;
  let fixture: ComponentFixture<WalletCreatedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletCreatedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletCreatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
