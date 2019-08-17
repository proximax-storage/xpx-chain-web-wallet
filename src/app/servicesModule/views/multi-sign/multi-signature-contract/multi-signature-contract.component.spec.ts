import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSignatureContractComponent } from './multi-signature-contract.component';

describe('MultiSignatureContractComponent', () => {
  let component: MultiSignatureContractComponent;
  let fixture: ComponentFixture<MultiSignatureContractComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiSignatureContractComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSignatureContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
