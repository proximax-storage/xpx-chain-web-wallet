import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WrapperAuthComponent } from './wrapper-auth.component';

describe('WrapperAuthComponent', () => {
  let component: WrapperAuthComponent;
  let fixture: ComponentFixture<WrapperAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WrapperAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
