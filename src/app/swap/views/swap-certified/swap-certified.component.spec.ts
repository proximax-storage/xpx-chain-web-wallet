import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapCertifiedComponent } from './swap-certified.component';

describe('SwapCertifiedComponent', () => {
  let component: SwapCertifiedComponent;
  let fixture: ComponentFixture<SwapCertifiedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwapCertifiedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwapCertifiedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
