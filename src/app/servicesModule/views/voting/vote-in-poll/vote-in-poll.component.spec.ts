import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteInPollComponent } from './vote-in-poll.component';

describe('VoteInPollComponent', () => {
  let component: VoteInPollComponent;
  let fixture: ComponentFixture<VoteInPollComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoteInPollComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoteInPollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
