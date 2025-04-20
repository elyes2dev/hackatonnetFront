import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Quiz } from 'src/app/demo/models/quiz.model';
import { QuizService } from 'src/app/demo/services/quiz.service';
import { UserQuizScoreService } from 'src/app/demo/services/user-quiz-score.service';
import { QuizfResultDialogComponent } from '../quizf-result-dialog/quizf-result-dialog.component';

@Component({
  selector: 'app-quizf-details',
  templateUrl: './quizf-details.component.html',
  styleUrls: ['./quizf-details.component.scss'],
  providers: [MessageService, DialogService]
})
export class QuizfDetailsComponent implements OnInit {
  quizId: number | null = null;
  workshopId: number | null = null;
  quiz: Quiz | null = null;
  loading = true;
  error: string | null = null;
  hasUserTakenQuiz = false;
  ref: DynamicDialogRef | undefined;
  userId = 1; // TODO: Get this from your auth service

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private userQuizScoreService: UserQuizScoreService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.quizId = +params['quizId'];
      this.workshopId = +params['workshopId'];
      this.loadQuiz();
      this.checkQuizStatus();
    });
  }

  loadQuiz(): void {
    if (!this.quizId) {
      this.error = 'Quiz ID is missing';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    this.quizService.getQuizById(this.quizId).subscribe({
      next: (quiz) => {
        this.quiz = {
          ...quiz,
          topics: quiz.topics || ['General Knowledge'],
          duration: quiz.duration || 30,
          passingScore: quiz.passingScore || 70
        };
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error loading quiz:', err);
        this.error = 'Failed to load quiz details. Please try again.';
        this.loading = false;
      }
    });
  }

  checkQuizStatus(): void {
    if (!this.quizId) return;
    
    this.userQuizScoreService.hasUserTakenQuiz(this.userId, this.quizId).subscribe({
      next: (hasTaken: boolean) => {
        this.hasUserTakenQuiz = hasTaken;
      },
      error: (err: Error) => {
        console.error('Error checking quiz status:', err);
      }
    });
  }

  showQuizResults(): void {
    this.ref = this.dialogService.open(QuizfResultDialogComponent, {
      data: {
        quizId: this.quizId,
        userId: this.userId,
      },
      header: 'Quiz Results',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true
    });
  }

  startQuiz(): void {
    if (!this.quiz || !this.workshopId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot start quiz. Missing required information.'
      });
      return;
    }

    this.router.navigate(['/workshopsf', this.workshopId, 'quizzes', this.quiz.id_quiz, 'score-add']);
  }

  goBack(): void {
    if (this.workshopId) {
      this.router.navigate(['/workshopsf', this.workshopId, 'quizzes']);
    } else {
      this.router.navigate(['/workshopsf']);
    }
  }

  getAnswerClass(answerIndex: number, correctAnswerIndex: number): string {
    return answerIndex === correctAnswerIndex ? 'correct' : 'incorrect';
  }
}
