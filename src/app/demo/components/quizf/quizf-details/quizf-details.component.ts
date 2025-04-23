import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Quiz } from 'src/app/demo/models/quiz.model';
import { QuizService } from 'src/app/demo/services/quiz.service';
import { UserQuizScoreService } from 'src/app/demo/services/user-quiz-score.service';
import { QuizfResultDialogComponent } from '../quizf-result-dialog/quizf-result-dialog.component';
import { QuizCertificateService } from 'src/app/demo/services/quizcertificate.service';
import { UserService } from 'src/app/demo/services/user.service';

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
  userId: number | null = null;
  userScore: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private userQuizScoreService: UserQuizScoreService,
    private certificateService: QuizCertificateService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Get the logged-in user's ID
    const loggedUserId = localStorage.getItem('loggedid');
    if (!loggedUserId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'You must be logged in to view quiz details'
      });
      this.router.navigate(['/login']);
      return;
    }
    this.userId = parseInt(loggedUserId, 10);

    // Get route parameters and load quiz data
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
        if (this.hasUserTakenQuiz) {
          this.loadUserScore();
        }
      },
      error: (err: Error) => {
        console.error('Error loading quiz:', err);
        this.error = 'Failed to load quiz details. Please try again.';
        this.loading = false;
      }
    });
  }

  checkQuizStatus(): void {
    if (!this.quizId || !this.userId) return;
    
    this.userQuizScoreService.hasUserTakenQuiz(this.userId, this.quizId).subscribe({
      next: (hasTaken: boolean) => {
        this.hasUserTakenQuiz = hasTaken;
        if (hasTaken) {
          this.loadUserScore();
        }
      },
      error: (err: Error) => {
        console.error('Error checking quiz status:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to check quiz status'
        });
      }
    });
  }

  loadUserScore(): void {
    if (!this.userId || !this.quizId) return;

    this.userQuizScoreService.getUserScoreForQuiz(this.userId, this.quizId).subscribe({
      next: (score) => {
        this.userScore = score;
      },
      error: (err) => {
        console.error('Error loading user score:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load quiz score'
        });
      }
    });
  }

  downloadCertificate(): void {
    if (!this.userId || !this.quiz?.title || this.userScore === null) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Missing required information for certificate'
      });
      return;
    }

    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.certificateService.downloadCertificate(user.username, this.quiz!.title, this.userScore!).subscribe({
          next: (response) => {
            const blob = new Blob([response.body!], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.quiz!.title}_certificate.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Certificate downloaded successfully'
            });
          },
          error: (err) => {
            console.error('Certificate download error:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Could not download the certificate'
            });
          }
        });
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch user information'
        });
      }
    });
  }

  showQuizResults(): void {
    if (!this.userId || !this.quizId) return;

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
