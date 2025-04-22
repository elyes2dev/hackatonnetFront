import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorApplicationDetailsComponent } from './mentor-application-details.component';

describe('MentorApplicationDetailsComponent', () => {
  let component: MentorApplicationDetailsComponent;
  let fixture: ComponentFixture<MentorApplicationDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MentorApplicationDetailsComponent]
    });
    fixture = TestBed.createComponent(MentorApplicationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
