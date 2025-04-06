import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizfDetailsComponent } from './quizf-details.component';

describe('QuizfDetailsComponent', () => {
  let component: QuizfDetailsComponent;
  let fixture: ComponentFixture<QuizfDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuizfDetailsComponent]
    });
    fixture = TestBed.createComponent(QuizfDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
