import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorDetailsDialogComponent } from './mentor-details-dialog.component';

describe('MentorDetailsDialogComponent', () => {
  let component: MentorDetailsDialogComponent;
  let fixture: ComponentFixture<MentorDetailsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MentorDetailsDialogComponent]
    });
    fixture = TestBed.createComponent(MentorDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
