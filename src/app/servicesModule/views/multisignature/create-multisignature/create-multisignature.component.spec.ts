import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMultisignatureComponent } from './create-multisignature.component';

describe('CreateMultisignatureComponent', () => {
  let component: CreateMultisignatureComponent;
  let fixture: ComponentFixture<CreateMultisignatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateMultisignatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMultisignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
