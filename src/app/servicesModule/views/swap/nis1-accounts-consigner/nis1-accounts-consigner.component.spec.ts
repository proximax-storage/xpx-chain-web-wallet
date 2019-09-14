import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Nis1AccountsConsignerComponent } from './nis1-accounts-consigner.component';

describe('Nis1AccountsConsignerComponent', () => {
  let component: Nis1AccountsConsignerComponent;
  let fixture: ComponentFixture<Nis1AccountsConsignerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Nis1AccountsConsignerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Nis1AccountsConsignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
