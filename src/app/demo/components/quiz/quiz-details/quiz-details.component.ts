import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Quiz } from 'src/app/demo/models/quiz.model';
import { QuizService } from 'src/app/demo/services/quiz.service';

@Component({
  selector: 'app-quiz-details',
  templateUrl: './quiz-details.component.html',
  styleUrls: ['./quiz-details.component.scss']
})
export class QuizDetailsComponent implements OnInit {
  quiz: Quiz | null = null;
  loading = true;
  error = '';
  workshopId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    // Get the workshopId and quizId from route parameters
    this.workshopId = this.route.snapshot.paramMap.get('workshopId');
    const quizId = +this.route.snapshot.paramMap.get('quizId')!;

    // Fetch quiz details
    this.quizService.getQuizById(quizId).subscribe({
      next: (quiz) => {
        console.log('Fetched quiz:', quiz); // 👈 Add this
        this.quiz = quiz;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load quiz details. Please try again.';
        this.loading = false;
      }
    });
  }

  getAnswerClass(answerIndex: number, correctAnswerIndex: number): string {
    return answerIndex === correctAnswerIndex ? 'correct' : 'incorrect';
  }
}
