import { Quiz } from './quiz.model';

export interface Question {
  id_question?: number;
  questionText: string;
  answers: string[]; // Multiple choice answers
  correctAnswerIndex: number; // Index of correct answer
  quiz: Quiz;
}
