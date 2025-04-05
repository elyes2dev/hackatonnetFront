import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/demo/services/quiz.service';
import { QuestionService } from 'src/app/demo/services/question.service';
import { Quiz } from 'src/app/demo/models/quiz.model';
import { Question } from 'src/app/demo/models/question.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-quiz-form',
  templateUrl: './quiz-form.component.html',
  styleUrls: ['./quiz-form.component.scss']
})
export class QuizFormComponent implements OnInit {
  quizForm: FormGroup;
  isEditMode = false;
  workshopId!: number;
  quizId?: number;
  loading = false;
  error = '';
  currentQuestionIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private quizService: QuizService,
    private questionService: QuestionService
  ) {
    this.quizForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      isPublished: [false],
      questions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.workshopId = +this.route.snapshot.params['workshopId'];
    this.quizId = this.route.snapshot.params['quizId'];

    if (this.quizId) {
      this.isEditMode = true;
      this.loadQuiz(this.quizId);
      this.loadQuestions(this.quizId);
    }
  }

  get questionsArray(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  getQuestionFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  getAnswers(formGroup: FormGroup): FormArray {
    return formGroup.get('answers') as FormArray;
  }

  createQuestionForm(): FormGroup {
    return this.fb.group({
      questionText: ['', Validators.required],
      answers: this.fb.array([this.fb.control('', Validators.required), this.fb.control('', Validators.required)]),
      correctAnswerIndex: [0, Validators.required]
    });
  }

  addQuestion(): void {
    this.questionsArray.push(this.createQuestionForm());
    this.currentQuestionIndex = this.questionsArray.length - 1;
  }

  removeQuestion(index: number): void {
    this.questionsArray.removeAt(index);
    if (this.currentQuestionIndex === index) {
      this.currentQuestionIndex = null;
    } else if (this.currentQuestionIndex && this.currentQuestionIndex > index) {
      this.currentQuestionIndex--;
    }
  }

  addAnswer(questionIndex: number): void {
    const questionGroup = this.getQuestionFormGroup(this.questionsArray.at(questionIndex));
    const answers = this.getAnswers(questionGroup);
    answers.push(this.fb.control('', Validators.required));
  }

  removeAnswer(questionIndex: number, answerIndex: number): void {
    const questionGroup = this.getQuestionFormGroup(this.questionsArray.at(questionIndex));
    const answers = this.getAnswers(questionGroup);
    answers.removeAt(answerIndex);
    
    const currentCorrectIndex = questionGroup.get('correctAnswerIndex')?.value;
    if (currentCorrectIndex >= answerIndex) {
      questionGroup.get('correctAnswerIndex')?.setValue(Math.max(0, currentCorrectIndex - 1));
    }
  }

  loadQuiz(quizId: number): void {
    this.loading = true;
    this.quizService.getQuizById(quizId).subscribe({
      next: (quiz) => {
        this.quizForm.patchValue({
          title: quiz.title,
          isPublished: quiz.isPublished
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load quiz data.';
        this.loading = false;
        console.error('Error loading quiz:', err);
      }
    });
  }

  loadQuestions(quizId: number): void {
    this.questionService.getAllQuestions().subscribe({
      next: (questions) => {
        questions.filter(q => q.quiz?.id_quiz === quizId).forEach(q => this.addQuestion());
      },
      error: (err) => {
        this.error = 'Failed to load questions.';
        console.error('Error loading questions:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.quizForm.invalid) {
      this.error = 'Please fill all required fields correctly.';
      return;
    }

    this.loading = true;
    this.error = '';

    const quizData: Quiz = {
      ...this.quizForm.value,
      workshop: { id: this.workshopId }
    };

    const operation = this.isEditMode
      ? this.quizService.updateQuiz(this.quizId!, quizData)
      : this.quizService.createQuiz(quizData);

    operation.subscribe({
      next: (quiz) => {
        // Replace saveQuestions with saveQuestionsBatch
        this.saveQuestionsBatch(this.quizForm.value.questions, quiz.id_quiz!); 
        if (!this.isEditMode) {
          this.router.navigate(['/workshops', this.workshopId, 'quizzes', quiz.id_quiz, 'edit']);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = this.isEditMode 
          ? 'Failed to update quiz. Please try again.' 
          : 'Failed to create quiz. Please try again.';
        this.loading = false;
        console.error('Error saving quiz:', err);
      }
    });
  }

  private saveQuestionsBatch(questions: any[], quizId: number): void {
    if (questions.length === 0) {
      this.loading = false;
      return;
    }

    // Type the 'question' parameter as 'Question' or 'any'
    const saveObservables = questions.map((question: any) => 
      this.questionService.createQuestion(question)
    );

    // Type the 'obs' parameter as 'Observable<any>' or more specific type if needed
    Promise.all(saveObservables.map((obs: Observable<any>) => obs.toPromise()))
      .then(() => {
        this.loading = false;
        if (this.isEditMode) {
          this.loadQuestions(quizId);
        }
      })
      .catch(err => {
        this.error = 'Error saving some questions.';
        this.loading = false;
        console.error('Error saving questions:', err);
      });
  }
}
