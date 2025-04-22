import { User } from './user';
import { Hackathon } from './hackathon';
import { Comment } from './comment';

export interface PageResponse<T> {
  content: T[];
  // ...
}


export interface Post {
  id: number;
  title: string;
  content: string;
  images: string[];
  likes?: User[]; 
  comments: Comment[];
  createdAt: Date;
  updatedAt?: Date;
  postedBy: User;
  hackathon: Hackathon;
}