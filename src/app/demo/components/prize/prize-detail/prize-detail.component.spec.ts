import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrizeDetailComponent } from './prize-detail.component';

describe('PrizeDetailComponent', () => {
  let component: PrizeDetailComponent;
  let fixture: ComponentFixture<PrizeDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrizeDetailComponent]
    });
    fixture = TestBed.createComponent(PrizeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
