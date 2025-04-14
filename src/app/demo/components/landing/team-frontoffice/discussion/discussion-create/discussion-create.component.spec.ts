import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionCreateComponent } from './discussion-create.component';

describe('DiscussionCreateComponent', () => {
  let component: DiscussionCreateComponent;
  let fixture: ComponentFixture<DiscussionCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiscussionCreateComponent]
    });
    fixture = TestBed.createComponent(DiscussionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
