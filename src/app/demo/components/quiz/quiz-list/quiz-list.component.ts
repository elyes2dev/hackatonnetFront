import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/demo/services/quiz.service';
import { Quiz } from 'src/app/demo/models/quiz.model';
import { UserQuizScoreService } from 'src/app/demo/services/user-quiz-score.service'; // Import the UserQuizScoreService
import { User } from 'src/app/demo/models/user.model'; // Import User model

@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.scss']
})
export class QuizListComponent implements OnInit {
  quizzes: Quiz[] = [];
  workshopId!: number;
  loading: boolean = true;
  error: string = '';
  currentUser!: User; // Store the current user

  constructor(
    private quizService: QuizService,
    private userQuizScoreService: UserQuizScoreService, // Inject the UserQuizScoreService
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.workshopId = +this.route.snapshot.paramMap.get('workshopId')!;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}'); // Get the current user from localStorage (or any other source)
    this.fetchQuizzes();
  }

  fetchQuizzes(): void {
    this.quizService.getQuizzesByWorkshop(this.workshopId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load quizzes.';
        this.loading = false;
      }
    });
  }

  deleteQuiz(id: number): void {
    if (confirm('Are you sure you want to delete this quiz?')) {
      this.quizService.deleteQuiz(id).subscribe(() => {
        this.quizzes = this.quizzes.filter(q => q.id_quiz !== id);
      });
    }
  }

  goToEdit(quizId: number): void {
    this.router.navigate(['/workshops', this.workshopId, 'quizzes', quizId, 'edit']);
  }

  goToDetails(quizId: number): void {
    this.router.navigate(['/workshops', this.workshopId, 'quizzes', quizId, 'details']);
  }

  goToAdd(): void {
    this.router.navigate(['/workshops', this.workshopId, 'quizzes', 'new']);
  }

  goToQuizScoreAdd(quizId: number): void {
    // Directly navigate to quiz-score-add without checking if the user has already taken the quiz
    this.router.navigate(['/workshops', this.workshopId, 'quizzes', quizId, 'score-add']);
  }
}
