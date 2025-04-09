import { User } from './user';
import { Post } from './post';
import { Prize } from './prize';
import { Team } from './team';

export interface Hackathon {
  id: number;
  title: string;
  location: string;
  logo: string;
  maxMembers: number;
  isOnline: boolean;
  description: string;
  startDate: string;  // Dates are typically sent as ISO strings (e.g. "2024-08-05T12:00:00Z")
  endDate: string;
  createdBy: User;
  createdAt: string;
  posts: Post[];
  prizes: Prize[];
  teams: Team[];
}