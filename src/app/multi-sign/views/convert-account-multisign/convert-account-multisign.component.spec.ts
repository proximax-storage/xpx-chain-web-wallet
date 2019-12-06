import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertAccountMultisignComponent } from './convert-account-multisign.component';

describe('ConvertAccountMultisignComponent', () => {
  let component: ConvertAccountMultisignComponent;
  let fixture: ComponentFixture<ConvertAccountMultisignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConvertAccountMultisignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvertAccountMultisignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
