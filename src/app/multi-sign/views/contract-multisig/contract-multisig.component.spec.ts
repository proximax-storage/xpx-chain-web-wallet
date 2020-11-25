import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractMultisigComponent } from './contract-multisig.component';

describe('ContractMultisigComponent', () => {
  let component: ContractMultisigComponent;
  let fixture: ComponentFixture<ContractMultisigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractMultisigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractMultisigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
