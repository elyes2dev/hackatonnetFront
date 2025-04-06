import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Quiz } from 'src/app/demo/models/quiz.model';
import { QuizService } from 'src/app/demo/services/quiz.service';

@Component({
  selector: 'app-quizf-details',
  templateUrl: './quizf-details.component.html',
  styleUrls: ['./quizf-details.component.scss']
})
export class QuizfDetailsComponent implements OnInit {
  quiz: Quiz | null = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const quizId = +this.route.snapshot.paramMap.get('quizId')!;
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
