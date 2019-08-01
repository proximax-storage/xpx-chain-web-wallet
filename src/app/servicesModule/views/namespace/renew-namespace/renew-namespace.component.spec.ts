import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewNamespaceComponent } from './renew-namespace.component';

describe('RenewNamespaceComponent', () => {
  let component: RenewNamespaceComponent;
  let fixture: ComponentFixture<RenewNamespaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenewNamespaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenewNamespaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
