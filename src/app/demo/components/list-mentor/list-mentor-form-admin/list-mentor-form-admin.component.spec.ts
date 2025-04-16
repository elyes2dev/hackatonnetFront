import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMentorFormAdminComponent } from './list-mentor-form-admin.component';

describe('ListMentorFormAdminComponent', () => {
  let component: ListMentorFormAdminComponent;
  let fixture: ComponentFixture<ListMentorFormAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListMentorFormAdminComponent]
    });
    fixture = TestBed.createComponent(ListMentorFormAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
