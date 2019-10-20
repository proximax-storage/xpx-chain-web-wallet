import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Nis1CosignerAccountsComponent } from './nis1-cosigner-accounts.component';

describe('Nis1CosignerAccountsComponent', () => {
  let component: Nis1CosignerAccountsComponent;
  let fixture: ComponentFixture<Nis1CosignerAccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Nis1CosignerAccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Nis1CosignerAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
