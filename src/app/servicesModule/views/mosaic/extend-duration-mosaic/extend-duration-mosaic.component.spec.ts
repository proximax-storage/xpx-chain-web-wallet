import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendDurationMosaicComponent } from './extend-duration-mosaic.component';

describe('ExtendDurationMosaicComponent', () => {
  let component: ExtendDurationMosaicComponent;
  let fixture: ComponentFixture<ExtendDurationMosaicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtendDurationMosaicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendDurationMosaicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
