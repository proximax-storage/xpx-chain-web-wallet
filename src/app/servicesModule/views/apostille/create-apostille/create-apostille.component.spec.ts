import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateApostilleComponent } from './create-apostille.component';

describe('CreateApostilleComponent', () => {
  let component: CreateApostilleComponent;
  let fixture: ComponentFixture<CreateApostilleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateApostilleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateApostilleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
