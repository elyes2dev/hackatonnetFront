import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionUpdateComponent } from './discussion-update.component';

describe('DiscussionUpdateComponent', () => {
  let component: DiscussionUpdateComponent;
  let fixture: ComponentFixture<DiscussionUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiscussionUpdateComponent]
    });
    fixture = TestBed.createComponent(DiscussionUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
