import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingCommentComponent } from './landing-comment.component';

describe('LandingCommentComponent', () => {
  let component: LandingCommentComponent;
  let fixture: ComponentFixture<LandingCommentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LandingCommentComponent]
    });
    fixture = TestBed.createComponent(LandingCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
