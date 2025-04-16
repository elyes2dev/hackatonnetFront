import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorApplicationListComponent } from './mentor-application-list.component';

describe('MentorApplicationListComponent', () => {
  let component: MentorApplicationListComponent;
  let fixture: ComponentFixture<MentorApplicationListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MentorApplicationListComponent]
    });
    fixture = TestBed.createComponent(MentorApplicationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
