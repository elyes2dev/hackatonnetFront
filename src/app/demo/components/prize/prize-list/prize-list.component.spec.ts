import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrizeListComponent } from './prize-list.component';

describe('PrizeListComponent', () => {
  let component: PrizeListComponent;
  let fixture: ComponentFixture<PrizeListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrizeListComponent]
    });
    fixture = TestBed.createComponent(PrizeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
