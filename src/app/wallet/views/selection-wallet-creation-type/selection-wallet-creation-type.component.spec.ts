import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionWalletCreationTypeComponent } from './selection-wallet-creation-type.component';

describe('SelectionWalletCreationTypeComponent', () => {
  let component: SelectionWalletCreationTypeComponent;
  let fixture: ComponentFixture<SelectionWalletCreationTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectionWalletCreationTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionWalletCreationTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
