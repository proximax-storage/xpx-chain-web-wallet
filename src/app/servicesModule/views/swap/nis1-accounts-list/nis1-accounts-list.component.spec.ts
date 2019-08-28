import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Nis1AccountsListComponent } from './nis1-accounts-list.component';

describe('Nis1AccountsListComponent', () => {
  let component: Nis1AccountsListComponent;
  let fixture: ComponentFixture<Nis1AccountsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Nis1AccountsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Nis1AccountsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
