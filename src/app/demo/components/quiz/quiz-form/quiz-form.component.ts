import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
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
      questions: this.fb.array([])  // Initialize an empty form array for questions
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

  createQuestionForm(question?: Question): FormGroup {
    return this.fb.group({
      questionText: [question?.questionText || '', Validators.required],
      correctAnswerIndex: [question?.correctAnswerIndex || 0, Validators.required],
      answers: this.fb.array((question?.answers || []).map(answer => this.fb.control(answer, Validators.required)))
    });
  }

  addQuestion(question?: Question): void {
    this.questionsArray.push(this.createQuestionForm(question));
  }

  removeQuestion(index: number): void {
    this.questionsArray.removeAt(index);
  }

  getQuestionFormGroup(index: number): FormGroup {
    return this.questionsArray.at(index) as FormGroup;
  }

  addAnswer(questionIndex: number) {
    const answers = this.questionsArray.at(questionIndex).get('answers') as FormArray;
    answers.push(this.fb.control('')); // Add an empty answer control
  }

  removeAnswer(questionIndex: number, answerIndex: number): void {
    const answers = this.getAnswers(questionIndex);
    answers.removeAt(answerIndex);
  }

  getAnswers(questionIndex: number): FormArray {
    return this.questionsArray.at(questionIndex).get('answers') as FormArray;
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
      }
    });
  }

  loadQuestions(quizId: number): void {
    this.questionService.getQuestionsByQuizId(quizId).subscribe({
      next: (questions) => {
        // Filter questions by quizId, then add each question to the form
        questions.forEach(q => this.addQuestion(q));
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
        // Save questions if necessary (this function is called after quiz creation or update)
        this.saveQuestionsBatch(this.quizForm.value.questions, quiz.id_quiz!);
  
        // Redirect to the quiz details page after creation or update
        this.router.navigate([
          '/workshops', 
          this.workshopId, 
          'quizzes', 
          quiz.id_quiz, 
          'details'
        ]);
  
        // If it's an edit operation, stop loading
        if (this.isEditMode) {
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = this.isEditMode
          ? 'Failed to update quiz. Please try again.'
          : 'Failed to create quiz. Please try again.';
        this.loading = false;
      }
    });
  }
  

  private saveQuestionsBatch(questions: any[], quizId: number): void {
    if (questions.length === 0) {
      this.loading = false;
      return;
    }

    const saveObservables = questions.map((question: any) => {
      if (question.id) {
        // Update existing questions
        return this.questionService.updateQuestion(question.id, question);
      } else {
        // Create new questions
        return this.questionService.createQuestion(question);
      }
    });

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
      });
  }
}
