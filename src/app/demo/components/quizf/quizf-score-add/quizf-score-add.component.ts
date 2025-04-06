import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/demo/services/quiz.service';
import { UserQuizScoreService } from 'src/app/demo/services/user-quiz-score.service';
import { Quiz } from 'src/app/demo/models/quiz.model';
import { UserQuizScoreRequest } from 'src/app/demo/models/user-quiz-score-request.model'; // Ensure the correct import
import { StorageService } from 'src/app/demo/services/storage.service'; // Import StorageService

@Component({
  selector: 'app-quizf-score-add',
  templateUrl: './quizf-score-add.component.html',
  styleUrls: ['./quizf-score-add.component.scss']
})
export class QuizfScoreAddComponent implements OnInit {
  quizId!: number;
  workshopId!: number;
  quiz!: Quiz;
  currentUser: any; // Replace with your actual User type
  userAnswers: { [questionId: number]: number } = {}; // Store the user's answers
  score: number = 0;
  userId: string | null = null; // Store user ID here

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

  onSubmit(): void {
    if (!this.userId) {
      alert('User not logged in!');
      return;
    }

    this.calculateScore();

    const request: UserQuizScoreRequest = {
      userId: parseInt(this.userId),  // Use the dynamically retrieved userId
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
}

