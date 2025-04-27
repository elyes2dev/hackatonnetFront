import { Hackathon } from "./hackathon";
import { Skill } from "./skill";
import { SponsorApplication } from "./sponsor-application";
import { SponsorReward } from "./sponsor-reward";
import { Role } from "./user.model";

export interface User {
  id: number;
  name: string;
  lastname?: string;
  email: string;
  username?: string;
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
  
}
