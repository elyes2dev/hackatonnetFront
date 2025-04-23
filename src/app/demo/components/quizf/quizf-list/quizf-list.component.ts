import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/demo/services/quiz.service';
import { UserQuizScoreService } from 'src/app/demo/services/user-quiz-score.service';
import { Quiz } from 'src/app/demo/models/quiz.model';
import { QuestionService } from 'src/app/demo/services/question.service';
import { Question } from 'src/app/demo/models/question.model';
import { StorageService } from 'src/app/demo/services/storage.service'; // Import StorageService
import { WorkshopService } from 'src/app/demo/services/workshop.service';
import { QuizCertificateService } from 'src/app/demo/services/quizcertificate.service';
import { UserService } from 'src/app/demo/services/user.service';
import { UserQuizScore } from 'src/app/demo/models/user-quiz-score.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-quizf-list',
  templateUrl: './quizf-list.component.html',
  styleUrls: ['./quizf-list.component.scss'],
  providers: [MessageService]
})
export class QuizfListComponent implements OnInit {
  quizzes: Quiz[] = [];
  workshopId!: number;
  loading: boolean = true;
  error: string = '';
  currentUserId: string | null = null; // Store user ID here
  quizStatusMap: { [key: number]: boolean } = {};
  showResultsDialog = false;
  currentQuizResults: any = {
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    questions: []
  };
  hasQuiz: boolean = false; // Track if the user has a quiz
  userIsOwner: boolean = false; // To check if the current user is the owner

  userScoresMap: { [quizId: number]: UserQuizScore } = {};

  constructor(
    private quizService: QuizService,
    private userQuizScoreService: UserQuizScoreService,
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService, // Inject StorageService
    private workshopService: WorkshopService,
    private certificateService: QuizCertificateService,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.workshopId = +this.route.snapshot.params['workshopId'];
    this.currentUserId = localStorage.getItem('loggedid');
    
    this.checkIfUserIsOwner();

    const userId = Number(localStorage.getItem('loggedid'));
    this.userQuizScoreService.getUserScores(userId).subscribe((scores: UserQuizScore[]) => {
      scores.forEach(score => {
        const quizId = score.quiz.id_quiz;
        if (quizId !== undefined) {
          this.userScoresMap[quizId] = score;
        }
      });
    });
  }

  loadQuizzes(): void {
    if (!this.workshopId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Workshop ID is missing'
      });
      return;
    }

    this.loading = true;
    this.quizService.getQuizzesByWorkshop(this.workshopId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        this.checkQuizStatuses();
        this.hasQuiz = this.quizzes.length > 0; // Set whether the user has any quiz
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load quizzes'
        });
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
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Quiz deleted successfully'
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete quiz'
          });
        }
      });
    }
  }

  editQuiz(quiz: Quiz): void {
    if (!this.workshopId) return;
    
    this.router.navigate(['/workshopsf', this.workshopId, 'quizzes', quiz.id_quiz, 'edit']);
  }

  viewQuizDetails(quiz: Quiz): void {
    if (!this.workshopId) return;
    
    this.router.navigate(['/workshopsf', this.workshopId, 'quizzes', quiz.id_quiz, 'details']);
  }

  createNewQuiz(): void {
    if (!this.workshopId) return;
    
    this.router.navigate(['/workshopsf', this.workshopId, 'quizzes', 'new']);
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

  goToAdd(): void {
    this.router.navigate(['/workshopsf', this.workshopId, 'quizzes', 'new']);
  }

  goToTakeQuiz(quizId: number): void {
    this.router.navigate(['/workshopsf', this.workshopId, 'quizzes', quizId, 'score-add']);
  }
  goBackToWorkshopList() {
    // Navigate back to the workshop list
    this.router.navigate(['/workshopsf']);  // Adjust the route as needed
  }

  // Fetch the logged-in user ID and compare with the owner of the workshop
  checkIfUserIsOwner(): void {
    const loggedUserId = localStorage.getItem('loggedid') ? parseInt(localStorage.getItem('loggedid')!, 10) : null;
  
    if (loggedUserId !== null && this.workshopId) {
      this.workshopService.getWorkshopById(this.workshopId).subscribe({
        next: (workshop) => {
          if (workshop && workshop.user) {
            this.userIsOwner = workshop.user.id === loggedUserId;
            // Only load quizzes after checking ownership
            this.loadQuizzes();
          } else {
            this.userIsOwner = false;
            this.loadQuizzes();
          }
        },
        error: (error) => {
          console.error('Error checking workshop ownership:', error);
          this.userIsOwner = false;
          this.loadQuizzes();
        }
      });
    } else {
      this.userIsOwner = false;
      this.loadQuizzes();
    }
  }

  downloadCertificate(quizId: number, quizTitle: string): void {
    const userId = localStorage.getItem('loggedid') ? +localStorage.getItem('loggedid')! : null;

    if (!userId) {
      alert('User not found');
      return;
    }

    // Step 1: Get user's score for this quiz
    this.userQuizScoreService.getUserScoreForQuiz(userId, quizId).subscribe({
      next: (score) => {
        // Step 2: Get the username
        this.userService.getUserById(userId).subscribe({
          next: (user) => {
            const username = user.username;

            // Step 3: Download certificate
            this.certificateService.downloadCertificate(username, quizTitle, score).subscribe({
              next: (response) => {
                const blob = new Blob([response.body!], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'certificate.pdf';
                a.click();
                window.URL.revokeObjectURL(url);
              },
              error: (err) => {
                console.error('Certificate download error:', err);
                alert('Could not download the certificate.');
              }
            });
          },
          error: () => {
            alert('Failed to fetch user info.');
          }
        });
      },
      error: () => {
        alert('Failed to retrieve user score.');
      }
    });
  }

  // Helper method to check if current user is the workshop owner
  isOwner(): boolean {
    return this.userIsOwner;
  }
}
