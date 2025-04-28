import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/demo/services/quiz.service';
import { UserQuizScoreService } from 'src/app/demo/services/user-quiz-score.service';
import { Quiz } from 'src/app/demo/models/quiz.model';
import { QuestionService } from 'src/app/demo/services/question.service';
import { Question } from 'src/app/demo/models/question.model';
import { StorageService } from 'src/app/demo/services/storage.service'; // Import StorageService
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AiQuizDialogComponent } from './ai-quiz-dialog/ai-quiz-dialog.component';
import { UserQuizScore } from 'src/app/demo/models/user-quiz-score.model';

@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.scss'],
  providers: [DialogService]
})
export class QuizListComponent implements OnInit {
  quizzes: Quiz[] = [];
  workshopId!: number;
  loading: boolean = true;
  error: string = '';
  currentUserId: string | null = null; // Store user ID here
  quizStatusMap: { [key: number]: boolean } = {};
  showResultsDialog = false;
  showAiQuizDialog = false; // Added this property
  currentQuizResults: any = {
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    questions: []
  };
  hasQuiz: boolean = false; // Track if the user has a quiz
  private dialogRef: DynamicDialogRef | undefined;
  showScoresDialog = false;
  currentQuizScores: UserQuizScore[] = [];
  selectedQuizId: number | null = null;

  constructor(
    private quizService: QuizService,
    private userQuizScoreService: UserQuizScoreService,
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService, // Inject StorageService
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    // Get the current userId dynamically from StorageService
    this.currentUserId = this.storageService.getUserId(); // Method to get userId from localStorage or other source

    if (!this.currentUserId) {
      alert('You must be logged in to access quizzes!');
      this.router.navigate(['/login']);
      return;
    }

    this.workshopId = +this.route.snapshot.params['workshopId'];
    this.fetchQuizzes();
  }

  fetchQuizzes(): void {
    this.quizService.getQuizzesByWorkshop(this.workshopId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        this.checkQuizStatuses();
        this.hasQuiz = this.quizzes.length > 0; // Set whether the user has any quiz
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load quizzes.';
        this.loading = false;
      }
    });
  }

  checkQuizStatuses(): void {
    this.quizzes.forEach(quiz => {
      this.userQuizScoreService.hasUserTakenQuiz(+this.currentUserId!, quiz.id_quiz!).subscribe({
        next: (hasTaken) => {
          this.quizStatusMap[quiz.id_quiz!] = hasTaken;
        },
        error: () => {
          this.quizStatusMap[quiz.id_quiz!] = false;
        }
      });
    });
  }

  deleteQuiz(id: number): void {
    if (confirm('Are you sure you want to delete this quiz?')) {
      this.quizService.deleteQuiz(id).subscribe({
        next: () => {
          // Remove the quiz from the list and update the hasQuiz state
          this.quizzes = this.quizzes.filter(q => q.id_quiz !== id);
          this.hasQuiz = this.quizzes.length > 0; // Update the state
          alert('Quiz deleted successfully');
        },
        error: () => {
          alert('Failed to delete quiz');
        }
      });
    }
  }

  goToEdit(quizId: number): void {
    if (this.quizStatusMap[quizId]) {
      this.showQuizResults(quizId);
    } else {
      this.router.navigate(['/workshops', this.workshopId, 'quizzes', quizId, 'edit']);
    }
  }

  showQuizResults(quizId: number): void {
    this.loading = true;
    this.questionService.getQuestionsByQuizId(quizId).subscribe({
      next: (questions) => {
        this.userQuizScoreService.getUserScoreForQuiz(+this.currentUserId!, quizId).subscribe({
          next: (score) => {
            // Simulate user answers - replace with actual data from your backend
            const userAnswers = this.simulateUserAnswers(questions);
            const correctCount = questions.filter((q, i) => 
              userAnswers[i] === q.correctAnswerIndex).length;

            this.currentQuizResults = {
              quizId: quizId,
              score: score,
              totalQuestions: questions.length,
              correctAnswers: correctCount,
              questions: questions.map((q, i) => ({
                ...q,
                userAnswer: userAnswers[i],
                isCorrect: userAnswers[i] === q.correctAnswerIndex
              }))
            };
            this.showResultsDialog = true;
            this.loading = false;
          },
          error: () => {
            alert('Failed to load score details');
            this.loading = false;
          }
        });
      },
      error: () => {
        alert('Failed to load questions');
        this.loading = false;
      }
    });
  }

  // Simulate user answers - replace with actual data from your backend
  private simulateUserAnswers(questions: Question[]): number[] {
    return questions.map(q => {
      // 70% chance to answer correctly
      return Math.random() > 0.3 ? q.correctAnswerIndex : 
             Math.floor(Math.random() * q.answers.length);
    });
  }

  closeResultsDialog(): void {
    this.showResultsDialog = false;
  }

  goToDetails(quizId: number): void {
    this.router.navigate(['/workshops', this.workshopId, 'quizzes', quizId, 'details']);
  }

  goToAdd(): void {
    this.router.navigate(['/workshops', this.workshopId, 'quizzes', 'new']);
  }

  goToTakeQuiz(quizId: number): void {
    this.router.navigate(['/workshops', this.workshopId, 'quizzes', quizId, 'score-add']);
  }
  goBackToWorkshopList() {
    // Navigate back to the workshop list
    this.router.navigate(['/workshops']);  // Adjust the route as needed
  }

  openAiQuizDialog() {
    this.showAiQuizDialog = true;
  }

  onAiQuizDialogClose() {
    this.showAiQuizDialog = false;
    this.fetchQuizzes();
  }

  ngOnDestroy() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  showQuizScores(quizId: number): void {
    this.selectedQuizId = quizId;
    this.loading = true;
    
    this.userQuizScoreService.getQuizScores(quizId).subscribe({
      next: (scores) => {
        this.currentQuizScores = scores;
        this.showScoresDialog = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading scores:', error);
        this.loading = false;
      }
    });
  }

  closeScoresDialog(): void {
    this.showScoresDialog = false;
    this.currentQuizScores = [];
    this.selectedQuizId = null;
  }

  getScorePercentage(score: UserQuizScore): number {
    return Math.round((score.score / 100) * 100);
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#2e7d32'; // Green
    if (score >= 60) return '#f57c00'; // Orange
    return '#d32f2f'; // Red
  }
}
