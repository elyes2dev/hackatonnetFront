import { User } from "./user";
import { Post } from './post';
import { Prize } from './prize';
import { Team } from './team';

export interface Hackathon {
    id: number;
    title: string;
    location: string;
    logo?: string;
    maxMembers: number;
    maxTeamSize?: number;
    isOnline?: boolean;
    description: string;
    startDate: string;
    endDate: string;
    createdBy: User;
    createdAt: string;
    posts: Post[];
    prizes: Prize[];
    teams: Team[];
  }
