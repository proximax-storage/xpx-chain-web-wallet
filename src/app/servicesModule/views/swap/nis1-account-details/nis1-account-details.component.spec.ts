import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Nis1AccountDetailsComponent } from './nis1-account-details.component';

describe('Nis1AccountDetailsComponent', () => {
  let component: Nis1AccountDetailsComponent;
  let fixture: ComponentFixture<Nis1AccountDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Nis1AccountDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Nis1AccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
