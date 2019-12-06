import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNamespaceComponent } from './create-namespace.component';

describe('CreateNamespaceComponent', () => {
  let component: CreateNamespaceComponent;
  let fixture: ComponentFixture<CreateNamespaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNamespaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNamespaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
