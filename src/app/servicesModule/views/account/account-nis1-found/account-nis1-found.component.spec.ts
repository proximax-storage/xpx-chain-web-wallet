import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountNis1FoundComponent } from './account-nis1-found.component';

describe('AccountNis1FoundComponent', () => {
  let component: AccountNis1FoundComponent;
  let fixture: ComponentFixture<AccountNis1FoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountNis1FoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountNis1FoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
