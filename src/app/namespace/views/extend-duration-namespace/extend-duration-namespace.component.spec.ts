import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendDurationNamespaceComponent } from './extend-duration-namespace.component';

describe('ExtendDurationNamespaceComponent', () => {
  let component: ExtendDurationNamespaceComponent;
  let fixture: ComponentFixture<ExtendDurationNamespaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExtendDurationNamespaceComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendDurationNamespaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
