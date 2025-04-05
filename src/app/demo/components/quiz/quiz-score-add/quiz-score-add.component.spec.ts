import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizScoreAddComponent } from './quiz-score-add.component';

describe('QuizScoreAddComponent', () => {
  let component: QuizScoreAddComponent;
  let fixture: ComponentFixture<QuizScoreAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuizScoreAddComponent]
    });
    fixture = TestBed.createComponent(QuizScoreAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
