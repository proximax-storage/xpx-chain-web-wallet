import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Nis1AccountFoundComponent } from './nis1-account-found.component';

describe('Nis1AccountFoundComponent', () => {
  let component: Nis1AccountFoundComponent;
  let fixture: ComponentFixture<Nis1AccountFoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Nis1AccountFoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Nis1AccountFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
