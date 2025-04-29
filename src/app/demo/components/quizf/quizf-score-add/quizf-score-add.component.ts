import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/demo/services/quiz.service';
import { UserQuizScoreService } from 'src/app/demo/services/user-quiz-score.service';
import { Quiz } from 'src/app/demo/models/quiz.model';
import { UserQuizScoreRequest } from 'src/app/demo/models/user-quiz-score-request.model'; // Ensure the correct import
import { StorageService } from 'src/app/demo/services/storage.service'; // Import StorageService
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-quizf-score-add',
  templateUrl: './quizf-score-add.component.html',
  styleUrls: ['./quizf-score-add.component.scss']
})
export class QuizfScoreAddComponent implements OnInit, OnDestroy {
  quizId!: number;
  workshopId!: number;
  quiz!: Quiz;
  currentUser: any; // Replace with your actual User type
  userAnswers: Record<number, number> = {}; // Store the user's answers
  score = 0;
  userId: string | null = null; // Store user ID here

  // Timer variables
  remainingTime = 600; // Set the initial timer to 30 seconds
  timerSubscription!: Subscription;
  progress = 0; // Progress bar percentage

  // Flag to track if the quiz has been submitted
  hasSubmitted = false;

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private userQuizScoreService: UserQuizScoreService,
    private router: Router,
    private storageService: StorageService // Inject StorageService
  ) {}

  ngOnInit(): void {
    // Get the quizId and workshopId from the route params
    this.workshopId = +this.route.snapshot.paramMap.get('workshopId')!;
    this.quizId = +this.route.snapshot.paramMap.get('quizId')!;

    // Get the current user from localStorage or another source
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Retrieve userId dynamically from StorageService (instead of static assignment)
    this.userId = this.storageService.getUserId(); // Method to get userId from localStorage or other source

    if (!this.userId) {
      alert('You must be logged in to submit a quiz score!');
      this.router.navigate(['/login']);
      return;
    }

    // Fetch the quiz by its ID
    this.fetchQuiz();

    // Start the countdown timer
    this.startTimer();
  }

  fetchQuiz(): void {
    this.quizService.getQuizById(this.quizId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
      },
      error: () => {
        alert('Failed to load quiz.');
      }
    });
  }

  startTimer(): void {
    this.timerSubscription = interval(600).subscribe(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.updateProgress();
      } else if (!this.hasSubmitted) {
        this.onSubmit(); // Auto-submit when time is up, if not already submitted
      }
    });
  }

  updateProgress(): void {
    this.progress = ((600 - this.remainingTime) / 600) * 100; // Update progress bar for 30 seconds
  }

  onSubmit(): void {
    if (this.hasSubmitted) {
      return; // Prevent multiple submissions
    }

    this.hasSubmitted = true; // Set the flag to true to prevent further submissions

    if (!this.userId) {
      alert('User not logged in!');
      return;
    }

    this.calculateScore();

    const request: UserQuizScoreRequest = {
      userId: parseInt(this.userId!),  // Use the dynamically retrieved userId
      quizId: this.quizId,
      score: this.score
    };

    // Save the user's score
    this.userQuizScoreService.saveScore(request).subscribe({
      next: () => {
        alert('Your score has been saved!');
        this.router.navigate(['/workshopsf', this.workshopId, 'quizzes']);
      },
      error: () => {
        alert('Failed to save score.');
        this.hasSubmitted = false; // Reset flag on error for potential retry
      }
    });
  }

  calculateScore(): void {
    // Calculate the score based on user's answers
    this.score = 0;
    this.quiz.questions?.forEach((question) => {
      const userAnswer = this.userAnswers[question.id_question!];
      if (userAnswer === question.correctAnswerIndex) {
        this.score++; // Award 1 point for correct answer
      }
    });
  }

  onReturn(): void {
    // Navigate back to the quizzes list page
    this.router.navigate(['/workshopsf', this.workshopId, 'quizzes']);
  }

  ngOnDestroy(): void {
    // Clean up the timer subscription to avoid memory leaks
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
