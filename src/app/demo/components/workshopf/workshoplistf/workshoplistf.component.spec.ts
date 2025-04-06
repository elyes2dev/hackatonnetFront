import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshoplistfComponent } from './workshoplistf.component';

describe('WorkshoplistfComponent', () => {
  let component: WorkshoplistfComponent;
  let fixture: ComponentFixture<WorkshoplistfComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkshoplistfComponent]
    });
    fixture = TestBed.createComponent(WorkshoplistfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
