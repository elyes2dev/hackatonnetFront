import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/demo/services/quiz.service';
import { UserQuizScoreService } from 'src/app/demo/services/user-quiz-score.service';
import { Quiz } from 'src/app/demo/models/quiz.model';
import { UserQuizScoreRequest } from 'src/app/demo/models/user-quiz-score-request.model'; // Ensure the correct import

@Component({
  selector: 'app-quiz-score-add',
  templateUrl: './quiz-score-add.component.html',
  styleUrls: ['./quiz-score-add.component.scss']
})
export class QuizScoreAddComponent implements OnInit {
  quizId!: number;
  workshopId!: number;
  quiz!: Quiz;
  currentUser: any; // Replace with your actual User type
  userAnswers: { [questionId: number]: number } = {}; // Store the user's answers
  score: number = 0;

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private userQuizScoreService: UserQuizScoreService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get the quizId and workshopId from the route params
    this.workshopId = +this.route.snapshot.paramMap.get('workshopId')!;
    this.quizId = +this.route.snapshot.paramMap.get('quizId')!;

    // Get the current user from localStorage or another source
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

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
    this.calculateScore();
  
    const request: UserQuizScoreRequest = {
      userId: 1,  // Static userId set to 1
      quizId: this.quizId,
      score: this.score
    };
  
    // Save the user's score
    this.userQuizScoreService.saveScore(request).subscribe({
      next: () => {
        alert('Your score has been saved!');
        this.router.navigate(['/workshops', this.workshopId, 'quizzes']);
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
