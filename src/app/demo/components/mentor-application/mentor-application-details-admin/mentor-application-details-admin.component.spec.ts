import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorApplicationDetailsAdminComponent } from './mentor-application-details-admin.component';

describe('MentorApplicationDetailsAdminComponent', () => {
  let component: MentorApplicationDetailsAdminComponent;
  let fixture: ComponentFixture<MentorApplicationDetailsAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MentorApplicationDetailsAdminComponent]
    });
    fixture = TestBed.createComponent(MentorApplicationDetailsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
