import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertAccountMultisigComponent } from './convert-account-multisig.component';

describe('ConvertAccountMultisigComponent', () => {
  let component: ConvertAccountMultisigComponent;
  let fixture: ComponentFixture<ConvertAccountMultisigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConvertAccountMultisigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvertAccountMultisigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
