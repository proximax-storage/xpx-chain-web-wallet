import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialComponent } from './partial.component';

describe('PartialComponent', () => {
  let component: PartialComponent;
  let fixture: ComponentFixture<PartialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
