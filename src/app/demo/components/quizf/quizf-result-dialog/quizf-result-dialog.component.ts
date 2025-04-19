import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { UserQuizScoreService } from 'src/app/demo/services/user-quiz-score.service';
import { QuestionService } from 'src/app/demo/services/question.service';

@Component({
  selector: 'app-quizf-result-dialog',
  templateUrl: './quizf-result-dialog.component.html',
  styleUrls: ['./quizf-result-dialog.component.scss']
})
export class QuizfResultDialogComponent implements OnInit {
  quizId!: number;
  userId!: number;
  score!: number;
  questions: any[] = [];
  loading = true;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private userQuizScoreService: UserQuizScoreService,
    private questionService: QuestionService
  ) {
    this.quizId = this.config.data.quizId;
    this.userId = this.config.data.userId;
    this.score = this.config.data.score;
  }

  ngOnInit(): void {
    this.loadQuizResults();
  }

  loadQuizResults(): void {
    this.questionService.getQuestionsByQuizId(this.quizId).subscribe({
      next: (questions) => {
        this.questions = questions.map(q => ({
          ...q,
          userAnswer: null, // You'll need to implement this based on your data model
          isCorrect: null   // You'll need to implement this based on your data model
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getCorrectAnswersCount(): number {
    return this.questions.filter(q => q.isCorrect).length;
  }

  getTimeTaken(): string {
    // This is a placeholder. You should implement actual time tracking
    return '10 minutes'; // Replace with actual time calculation
  }

  downloadCertificate(): void {
    if (this.score >= 70) {
      // Implement certificate download logic here
      console.log('Downloading certificate...');
    }
  }
}