import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionAccountTypeComponent } from './selection-account-creation-type.component';

describe('SelectionAccountTypeComponent', () => {
  let component: SelectionAccountTypeComponent;
  let fixture: ComponentFixture<SelectionAccountTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectionAccountTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionAccountTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
