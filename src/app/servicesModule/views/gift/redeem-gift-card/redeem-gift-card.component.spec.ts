import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemGiftCardComponent } from './redeem-gift-card.component';

describe('RedeemGiftCardComponent', () => {
  let component: RedeemGiftCardComponent;
  let fixture: ComponentFixture<RedeemGiftCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedeemGiftCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedeemGiftCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
