import { TeamSubmission } from './team-submission';
import { User } from './user';

export interface ProjectEvaluation {
  id?: number;
  score: number;
  feedback: string;
  evaluationDate?: Date | string;
  projectName?: string; // Ajouté pour correspondre à Swagger
  teamSubmission?: TeamSubmission; // Optionnel, car pas toujours renvoyé
  evaluator?: User; // Optionnel, car masqué par @JsonProperty(WRITE_ONLY)
}