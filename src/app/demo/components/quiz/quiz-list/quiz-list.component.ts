import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Quiz } from 'src/app/demo/models/quiz.model';
import { QuizService } from 'src/app/demo/services/quiz.service';

@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.scss']
})
export class QuizListComponent implements OnInit {
  quizzes: Quiz[] = [];
  workshopId!: number;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.workshopId = +this.route.snapshot.params['workshopId'];
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.loading = true;
    this.error = '';
    this.quizService.getAllQuizzes().subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes.filter(q => q.workshop?.id === this.workshopId);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load quizzes. Please try again later.';
        this.loading = false;
        console.error('Error loading quizzes:', err);
      }
    });
  }

  deleteQuiz(quizId: number): void {
    if (confirm('Are you sure you want to delete this quiz?')) {
      this.quizService.deleteQuiz(quizId).subscribe({
        next: () => {
          this.loadQuizzes(); // Refresh the list
        },
        error: (err) => {
          this.error = 'Failed to delete quiz. Please try again.';
          console.error('Error deleting quiz:', err);
        }
      });
    }
  }

  navigateToQuestions(quizId: number): void {
    this.router.navigate(['/workshops', this.workshopId, 'quizzes', quizId, 'questions']);
  }

  navigateToScores(quizId: number): void {
    this.router.navigate(['/workshops', this.workshopId, 'quizzes', quizId, 'scores']);
  }
}