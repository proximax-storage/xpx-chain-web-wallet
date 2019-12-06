import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMultiSignatureComponent } from './create-multi-signature.component';

describe('CreateMultiSignatureComponent', () => {
  let component: CreateMultiSignatureComponent;
  let fixture: ComponentFixture<CreateMultiSignatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateMultiSignatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMultiSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
