import { User } from 'src/app/demo/models/user'; // Adjust the path as necessary


export interface Comment {
  id?: number;
  content: string;
  userId?: number;
  userFullName?: string;
  userPicture?: string;
  createdAt?: Date;
}
