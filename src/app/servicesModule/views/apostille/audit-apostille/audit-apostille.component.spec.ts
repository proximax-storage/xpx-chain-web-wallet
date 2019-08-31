import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditApostilleComponent } from './audit-apostille.component';

describe('AuditApostilleComponent', () => {
  let component: AuditApostilleComponent;
  let fixture: ComponentFixture<AuditApostilleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditApostilleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditApostilleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
