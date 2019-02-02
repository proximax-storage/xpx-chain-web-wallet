import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMultisignatureContractComponent } from './edit-multisignature-contract.component';

describe('EditMultisignatureContractComponent', () => {
  let component: EditMultisignatureContractComponent;
  let fixture: ComponentFixture<EditMultisignatureContractComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditMultisignatureContractComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMultisignatureContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
