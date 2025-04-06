import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopfDetailsComponent } from './workshopf-details.component';

describe('WorkshopfDetailsComponent', () => {
  let component: WorkshopfDetailsComponent;
  let fixture: ComponentFixture<WorkshopfDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkshopfDetailsComponent]
    });
    fixture = TestBed.createComponent(WorkshopfDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
