import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmRedeemGitfCardComponent } from './confirm-redeem-gitf-card.component';

describe('ConfirmRedeemGitfCardComponent', () => {
  let component: ConfirmRedeemGitfCardComponent;
  let fixture: ComponentFixture<ConfirmRedeemGitfCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmRedeemGitfCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmRedeemGitfCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
