import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizfResultDialogComponent } from './quizf-result-dialog.component';

describe('QuizfResultDialogComponent', () => {
  let component: QuizfResultDialogComponent;
  let fixture: ComponentFixture<QuizfResultDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuizfResultDialogComponent]
    });
    fixture = TestBed.createComponent(QuizfResultDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
