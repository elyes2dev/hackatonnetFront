import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/demo/services/quiz.service';
import { Quiz } from 'src/app/demo/models/quiz.model';

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

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.workshopId = +this.route.snapshot.paramMap.get('workshopId')!;
    console.log("Workshop ID:", this.workshopId);
    this.fetchQuizzes();
  }

  fetchQuizzes(): void {
    this.quizService.getQuizzesByWorkshop(this.workshopId).subscribe({
      next: (quizzes) => {
        console.log("Fetched quizzes:", quizzes); // Log the quizzes structure
        this.quizzes = quizzes; // Directly assign quizzes without filtering
        this.quizzes.forEach(quiz => {
          console.log("Workshop for quiz:", quiz.workshop); // Log the workshop object for each quiz
        });
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
}
