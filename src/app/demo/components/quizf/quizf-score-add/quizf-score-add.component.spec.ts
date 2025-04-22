import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizfScoreAddComponent } from './quizf-score-add.component';

describe('QuizfScoreAddComponent', () => {
  let component: QuizfScoreAddComponent;
  let fixture: ComponentFixture<QuizfScoreAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuizfScoreAddComponent]
    });
    fixture = TestBed.createComponent(QuizfScoreAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
