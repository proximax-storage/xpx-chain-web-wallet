import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGiftComponent } from './create-gift.component';

describe('CreateGiftComponent', () => {
  let component: CreateGiftComponent;
  let fixture: ComponentFixture<CreateGiftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGiftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
