import { User } from './user';
import { Hackathon } from './hackathon';

export interface Post {
  id: number;
  title: string;
  logo: string;
  postedBy: User;
  hackathon: Hackathon;
  createdAt: string; // ISO 8601 date string format
}
