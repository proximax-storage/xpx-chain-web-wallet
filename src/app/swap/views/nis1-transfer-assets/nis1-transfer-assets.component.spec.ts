import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Nis1TransferAssetsComponent } from './nis1-transfer-assets.component';

describe('Nis1TransferAssetsComponent', () => {
  let component: Nis1TransferAssetsComponent;
  let fixture: ComponentFixture<Nis1TransferAssetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Nis1TransferAssetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Nis1TransferAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
