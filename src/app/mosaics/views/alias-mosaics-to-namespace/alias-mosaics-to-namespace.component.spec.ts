import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AliasMosaicsToNamespaceComponent } from './alias-mosaics-to-namespace.component';

describe('AliasMosaicsToNamespaceComponent', () => {
  let component: AliasMosaicsToNamespaceComponent;
  let fixture: ComponentFixture<AliasMosaicsToNamespaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AliasMosaicsToNamespaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AliasMosaicsToNamespaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
