import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllWalletsComponent } from './view-all-wallets.component';

describe('ViewAllWalletsComponent', () => {
  let component: ViewAllWalletsComponent;
  let fixture: ComponentFixture<ViewAllWalletsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAllWalletsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAllWalletsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
