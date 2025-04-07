import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMentorFormComponent } from './list-mentor-form.component';

describe('ListMentorFormComponent', () => {
  let component: ListMentorFormComponent;
  let fixture: ComponentFixture<ListMentorFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListMentorFormComponent]
    });
    fixture = TestBed.createComponent(ListMentorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
