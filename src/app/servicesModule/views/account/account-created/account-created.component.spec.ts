import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountCreatedComponent } from './account-created.component';

describe('AccountCreatedComponent', () => {
  let component: AccountCreatedComponent;
  let fixture: ComponentFixture<AccountCreatedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountCreatedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountCreatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
