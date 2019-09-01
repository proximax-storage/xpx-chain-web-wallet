import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttestationTypeComponent } from './attestation-type.component';

describe('AttestationTypeComponent', () => {
  let component: AttestationTypeComponent;
  let fixture: ComponentFixture<AttestationTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttestationTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttestationTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
