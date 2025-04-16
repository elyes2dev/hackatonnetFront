import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrizeFormComponent } from './prize-form.component';

describe('PrizeFormComponent', () => {
  let component: PrizeFormComponent;
  let fixture: ComponentFixture<PrizeFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrizeFormComponent]
    });
    fixture = TestBed.createComponent(PrizeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
