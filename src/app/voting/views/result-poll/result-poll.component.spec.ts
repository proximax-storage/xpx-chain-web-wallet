import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultPollComponent } from './result-poll.component';

describe('ResultPollComponent', () => {
  let component: ResultPollComponent;
  let fixture: ComponentFixture<ResultPollComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultPollComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultPollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
