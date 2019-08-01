import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailAccountComponent } from './detail-account.component';

describe('DetailAccountComponent', () => {
  let component: DetailAccountComponent;
  let fixture: ComponentFixture<DetailAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
