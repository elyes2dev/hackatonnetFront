import { Hackathon } from "./hackathon";
import { Role } from "./role";
import { Skill } from "./skill";
import { SponsorApplication } from "./sponsor-application";
import { SponsorReward } from "./sponsor-reward";

export enum BadgeLevel {
    JUNIOR_COACH = 'JUNIOR_COACH',
    ASSISTANT_COACH = 'ASSISTANT_COACH',
    SENIOR_COACH = 'SENIOR_COACH',
    HEAD_COACH = 'HEAD_COACH',
    MASTER_MENTOR = 'MASTER_MENTOR'
  }
export interface User {
    id?: number;
  name: string;
  lastname: string;
  birthdate?: Date;
  picture?: string;
  description?: string;
  score?: number;
  createdAt?: Date;
  roles?: Role[];
  skills?: Skill[];
  hackathons?: Hackathon[];
  sponsorApplication?: SponsorApplication;
  sponsorReward?: SponsorReward;
  monitorPoints?: number;
  badge?: BadgeLevel;
}
