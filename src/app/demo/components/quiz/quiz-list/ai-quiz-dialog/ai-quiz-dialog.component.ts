import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, throwError } from 'rxjs';
import { QuizService } from 'src/app/demo/services/quiz.service';
import { AiQuizService } from 'src/app/demo/services/ai-quiz.service';
import { Question } from 'src/app/demo/models/question.model';
import { Quiz } from 'src/app/demo/models/quiz.model';
import { Workshop } from 'src/app/demo/models/workshop.model';
import { ThemeEnum } from 'src/app/demo/models/theme.enum';
import { QuestionService } from 'src/app/demo/services/question.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-ai-quiz-dialog',
  templateUrl: './ai-quiz-dialog.component.html',
  styleUrls: ['./ai-quiz-dialog.component.scss'],
  providers: [MessageService]
})
export class AiQuizDialogComponent {
  @Input() workshopId!: number;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() quizSaved = new EventEmitter<void>();
  
  selectedFile: File | null = null;
  loading = false;
  error: string | null = null;
  generatedQuestions: Question[] = [];
  generatedQuiz: Quiz | null = null;

  constructor(
    private aiQuizService: AiQuizService,
    private quizService: QuizService,
    private questionService: QuestionService,
    private messageService: MessageService
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
            // Create the quiz object with required fields
            this.generatedQuiz = {
              title: 'AI Generated Quiz',
              isPublished: false,
              workshop: { id: this.workshopId } as Workshop,
              topics: ['AI Generated'],
              duration: 30,
              passingScore: 70,
              questions: []
            };

            // Transform the AI-generated questions to match the Question model
            this.generatedQuestions = response.questions.map(q => {
              const question: Question = {
                questionText: q.questionText,
                answers: q.answers || [],
                correctAnswerIndex: q.correctAnswerIndex || 0,
                quiz: this.generatedQuiz as Quiz
              };
              return question;
            });
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
    if (!this.generatedQuestions.length || !this.generatedQuiz) {
      this.error = 'No questions to save';
      return;
    }

    this.loading = true;
    this.error = null;

    // First, create the quiz
    this.quizService.createQuiz(this.generatedQuiz).subscribe({
      next: (savedQuiz) => {
        // Create properly formatted questions with the saved quiz reference
        const questionsToSave = this.generatedQuestions.map(question => {
          const formattedQuestion: Question = {
            questionText: question.questionText,
            answers: question.answers,
            correctAnswerIndex: question.correctAnswerIndex,
            quiz: savedQuiz // Use the saved quiz reference
          };
          return formattedQuestion;
        });

        // Create all questions using the question service
        const questionObservables = questionsToSave.map(question => 
          this.questionService.createQuestion(question)
        );

        // Save all questions
        forkJoin(questionObservables).subscribe({
          next: (savedQuestions) => {
            // Update the quiz with the saved questions
            savedQuiz.questions = savedQuestions;
            
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Quiz and questions saved successfully'
            });
            this.quizSaved.emit();
            this.closeDialog.emit();
          },
          error: (err) => {
            console.error('Error saving questions:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to save questions'
            });
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error saving quiz:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save quiz'
        });
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.closeDialog.emit();
  }
}
