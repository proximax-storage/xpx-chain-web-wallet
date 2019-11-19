import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterNamespaceTypeBondedComponent } from './register-namespace-type-bonded.component';

describe('RegisterNamespaceTypeBondedComponent', () => {
  let component: RegisterNamespaceTypeBondedComponent;
  let fixture: ComponentFixture<RegisterNamespaceTypeBondedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterNamespaceTypeBondedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterNamespaceTypeBondedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
