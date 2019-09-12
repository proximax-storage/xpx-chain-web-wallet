import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferAssetsComponent } from './transfer-assets.component';

describe('TransferAssetsComponent', () => {
  let component: TransferAssetsComponent;
  let fixture: ComponentFixture<TransferAssetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferAssetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
