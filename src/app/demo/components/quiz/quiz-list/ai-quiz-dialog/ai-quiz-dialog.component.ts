import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, throwError } from 'rxjs';
import { QuizService } from 'src/app/demo/services/quiz.service';
import { AiQuizService } from 'src/app/demo/services/ai-quiz.service';
import { Question } from 'src/app/demo/models/question.model';
import { Quiz } from 'src/app/demo/models/quiz.model';
import { Workshop } from 'src/app/demo/models/workshop.model';
import { ThemeEnum } from 'src/app/demo/models/theme.enum';

@Component({
  selector: 'app-ai-quiz-dialog',
  templateUrl: './ai-quiz-dialog.component.html',
  styleUrls: ['./ai-quiz-dialog.component.scss']
})
export class AiQuizDialogComponent {
  @Input() workshopId!: number;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() quizSaved = new EventEmitter<void>();
  
  selectedFile: File | null = null;
  loading = false;
  error: string | null = null;
  generatedQuestions: Question[] = [];

  constructor(
    private aiQuizService: AiQuizService,
    private quizService: QuizService
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        this.error = 'File size should not exceed 10MB';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
      this.error = null;
    } else {
      this.error = 'Please select a valid PDF file';
      this.selectedFile = null;
    }
  }

  generateQuiz(): void {
    if (!this.selectedFile) {
      this.error = 'Please select a PDF file first';
      return;
    }

    this.loading = true;
    this.error = null;

    this.aiQuizService.generateQuizFromPDF(this.selectedFile)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'An error occurred while generating the quiz';
          if (error.status === 413) {
            errorMessage = 'The PDF file is too large. Please select a smaller file.';
          } else if (error.status === 415) {
            errorMessage = 'Invalid file format. Please select a PDF file.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          return throwError(() => errorMessage);
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.questions) {
            // Create a base workshop object
            const workshop: Workshop = {
              id: this.workshopId,
              name: '',  // These will be updated when saving
              description: '',
              photo: '',
              theme: ThemeEnum.Default,  // Using default theme
              user: undefined,
              resources: [],
              quiz: null
            };

            // Create a base quiz object
            const quiz: Quiz = {
              title: 'AI Generated Quiz',
              isPublished: false,
              workshop: workshop
            };

            // Transform the AI-generated questions to match your Question model format
            this.generatedQuestions = response.questions.map(q => ({
              questionText: q.questionText,
              answers: q.answers,
              correctAnswerIndex: q.correctAnswerIndex,
              quiz: quiz
            }));
          }
          this.loading = false;
        },
        error: (error: string) => {
          this.error = error;
          this.loading = false;
        }
      });
  }

  saveQuiz(): void {
    if (!this.generatedQuestions.length) {
      this.error = 'No questions to save';
      return;
    }

    this.loading = true;
    const saveRequests = this.generatedQuestions.map(question => {
      const questionWithWorkshop = {
        ...question,
        workshopId: this.workshopId
      };
      return this.quizService.saveQuestion(questionWithWorkshop).pipe(
        catchError(error => {
          console.error(`Failed to save question: ${question.questionText}`, error);
          return throwError(() => error);
        })
      );
    });

    forkJoin(saveRequests)
      .pipe(
        catchError(error => {
          this.error = 'Some questions failed to save. Please try again.';
          return throwError(() => error);
        })
      )
      .subscribe({
        next: () => {
          this.quizSaved.emit();
          this.closeDialog.emit();
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  cancel(): void {
    this.closeDialog.emit();
  }
}
