import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAccountMultisignComponent } from './edit-account-multisign.component';

describe('EditAccountMultisignComponent', () => {
  let component: EditAccountMultisignComponent;
  let fixture: ComponentFixture<EditAccountMultisignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAccountMultisignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAccountMultisignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
