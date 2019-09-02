import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteTypeComponent } from './vote-type.component';

describe('VoteTypeComponent', () => {
  let component: VoteTypeComponent;
  let fixture: ComponentFixture<VoteTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoteTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoteTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
