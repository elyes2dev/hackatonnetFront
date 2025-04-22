import { MentorApplication } from "./mentor-application.model";

export interface PreviousExperience {
    id?: number;
    application?: MentorApplication;
    year: number;
    description: string;
    hackathonName: string;
    numberOfTeamsCoached: number;
  }