import { Team } from "./team.model";
import { User } from "./user.model";

export interface MentorEvaluation {
    id?: number;
    mentor: User;
    team: Team;
    rating: number;
    feedbackText: string;
    createdAt?: Date;
  }