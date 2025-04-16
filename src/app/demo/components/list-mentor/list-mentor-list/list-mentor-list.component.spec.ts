import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMentorListComponent } from './list-mentor-list.component';

describe('ListMentorListComponent', () => {
  let component: ListMentorListComponent;
  let fixture: ComponentFixture<ListMentorListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListMentorListComponent]
    });
    fixture = TestBed.createComponent(ListMentorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
