import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAccountMultisigComponent } from './edit-account-multisig.component';

describe('EditAccountMultisigComponent', () => {
  let component: EditAccountMultisigComponent;
  let fixture: ComponentFixture<EditAccountMultisigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAccountMultisigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAccountMultisigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
