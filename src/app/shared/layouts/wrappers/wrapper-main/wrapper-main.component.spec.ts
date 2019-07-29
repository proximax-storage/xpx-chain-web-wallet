import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WrapperMainComponent } from './wrapper-main.component';

describe('WrapperMainComponent', () => {
  let component: WrapperMainComponent;
  let fixture: ComponentFixture<WrapperMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WrapperMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
