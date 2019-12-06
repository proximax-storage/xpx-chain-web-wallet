import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AliasAddressToNamespaceComponent } from './alias-address-to-namespace.component';

describe('AliasAddressToNamespaceComponent', () => {
  let component: AliasAddressToNamespaceComponent;
  let fixture: ComponentFixture<AliasAddressToNamespaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AliasAddressToNamespaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AliasAddressToNamespaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
