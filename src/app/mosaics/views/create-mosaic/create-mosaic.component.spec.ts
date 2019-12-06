import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMosaicComponent } from './create-mosaic.component';

describe('CreateMosaicComponent', () => {
  let component: CreateMosaicComponent;
  let fixture: ComponentFixture<CreateMosaicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateMosaicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMosaicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
