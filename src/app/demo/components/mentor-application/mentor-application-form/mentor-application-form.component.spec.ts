import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorApplicationFormComponent } from './mentor-application-form.component';

describe('MentorApplicationFormComponent', () => {
  let component: MentorApplicationFormComponent;
  let fixture: ComponentFixture<MentorApplicationFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MentorApplicationFormComponent]
    });
    fixture = TestBed.createComponent(MentorApplicationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
