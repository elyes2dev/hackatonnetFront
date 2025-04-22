import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopfFormComponent } from './workshopf-form.component';

describe('WorkshopfFormComponent', () => {
  let component: WorkshopfFormComponent;
  let fixture: ComponentFixture<WorkshopfFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkshopfFormComponent]
    });
    fixture = TestBed.createComponent(WorkshopfFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
