import { Question } from './question.model';
import { UserQuizScore } from './user-quiz-score.model';
import { Workshop } from './workshop.model'; // Assuming you have this model

export interface Quiz {
  id_quiz?: number;
  title: string;
  workshop: Workshop;
  questions?: Question[];
  isPublished: boolean;
  userQuizScores?: UserQuizScore[];
}
