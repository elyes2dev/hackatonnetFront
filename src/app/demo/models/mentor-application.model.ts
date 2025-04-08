import { PreviousExperience } from "./previous-experience.model";
import { User } from "./user.model";

export interface MentorApplication {
    id?: number;
    user: User;
    applicationText: string;
    cv: string;
    uploadPaper: string;
    links: string[];
    hasPreviousExperience: boolean;
    status: ApplicationStatus;
    previousExperiences?: PreviousExperience[];
    createdAt?: Date;
  }

  export enum ApplicationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
  }
  