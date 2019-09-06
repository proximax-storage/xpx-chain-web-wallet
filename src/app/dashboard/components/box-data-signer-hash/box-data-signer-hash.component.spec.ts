import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxDataSignerHashComponent } from './box-data-signer-hash.component';

describe('BoxDataSignerHashComponent', () => {
  let component: BoxDataSignerHashComponent;
  let fixture: ComponentFixture<BoxDataSignerHashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoxDataSignerHashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxDataSignerHashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
