import { User } from './user';
import { TeamMember } from './team-members';

export interface TeamDiscussion {
  id: number;
  teamMember: TeamMember;
  user: User;
  message: string;
  createdAt: string; // ISO string date
}
