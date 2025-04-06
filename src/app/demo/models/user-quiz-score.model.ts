import { Quiz } from './quiz.model';
import { User } from './user.model'; // Assuming you have this model

export interface UserQuizScore {
  id?: number;
  quiz: Quiz;
  user: User;
  score: number;
}
