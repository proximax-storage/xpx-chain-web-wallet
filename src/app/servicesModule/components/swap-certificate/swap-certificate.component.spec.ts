import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapCertificateComponent } from './swap-certificate.component';

describe('SwapCertificateComponent', () => {
  let component: SwapCertificateComponent;
  let fixture: ComponentFixture<SwapCertificateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwapCertificateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwapCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
