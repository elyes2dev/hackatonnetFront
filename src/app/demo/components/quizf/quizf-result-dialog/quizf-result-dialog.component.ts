import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { UserQuizScoreService } from 'src/app/demo/services/user-quiz-score.service';
import { QuestionService } from 'src/app/demo/services/question.service';
import { UserQuizScore } from 'src/app/demo/models/user-quiz-score.model';
import { Question } from 'src/app/demo/models/question.model';

interface QuestionResult extends Question {
  isCorrect: boolean;
  userAnswer: number | null;
}

interface QuizResults {
  score: number;
  startTime: Date;
  endTime: Date;
  answers: QuizAnswer[];
}

interface QuizAnswer {
  isCorrect: boolean;
  selectedAnswer: string;
  questionText: string;
}

@Component({
  selector: 'app-quizf-result-dialog',
  templateUrl: './quizf-result-dialog.component.html',
  styleUrls: ['./quizf-result-dialog.component.scss']
})
export class QuizfResultDialogComponent implements OnInit {
  quizId!: number;
  userId!: number;
  score!: number;
  questions: QuestionResult[] = [];
  loading = true;
  quizResults: QuizResults | null = null;
  userQuizScore: UserQuizScore | null = null;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private userQuizScoreService: UserQuizScoreService,
    private questionService: QuestionService
  ) {
    this.quizId = this.config.data.quizId;
    this.userId = this.config.data.userId;
  }

  ngOnInit(): void {
    this.loadQuizResults();
  }

  loadQuizResults(): void {
    // Load both questions and user score
    this.questionService.getQuestionsByQuizId(this.quizId).subscribe({
      next: (questions) => {
        // Transform questions to include result-specific properties
        this.questions = questions.map(q => ({
          ...q,
          isCorrect: false, // Will be updated when we load user answers
          userAnswer: null // Will be updated when we load user answers
        }));
        this.loadUserScore();
      },
      error: (error: Error) => {
        console.error('Error loading questions:', error);
        this.loading = false;
      }
    });
  }

  loadUserScore(): void {
    this.userQuizScoreService.getUserScoreForQuiz(this.userId, this.quizId).subscribe({
      next: (score) => {
        this.score = score;
        // Here you would typically also load the user's answers and update the questions
        this.updateQuestionsWithUserAnswers();
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading user score:', error);
        this.loading = false;
      }
    });
  }

  updateQuestionsWithUserAnswers(): void {
    // This is a placeholder - you'll need to implement the actual logic
    // to get user answers from your backend and update the questions
    this.questions = this.questions.map(question => ({
      ...question,
      isCorrect: question.userAnswer === question.correctAnswerIndex
    }));
  }

  getCorrectAnswersCount(): number {
    return this.questions.filter(q => q.isCorrect).length;
  }

  getTimeTaken(): string {
    if (!this.quizResults?.startTime || !this.quizResults?.endTime) {
      return '0 minutes';
    }
    
    const start = new Date(this.quizResults.startTime);
    const end = new Date(this.quizResults.endTime);
    const diffInMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    
    if (diffInMinutes < 1) {
      return 'Less than a minute';
    } else if (diffInMinutes === 1) {
      return '1 minute';
    } else {
      return `${diffInMinutes} minutes`;
    }
  }

  downloadCertificate(): void {
    // TODO: Implement certificate download functionality
    console.log('Downloading certificate...');
  }

  close(): void {
    this.ref.close();
  }
}