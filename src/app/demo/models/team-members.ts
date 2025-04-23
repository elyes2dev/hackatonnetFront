import { Team } from './team';
import { User } from './user';
import { TeamDiscussion } from './team-discussion';

export interface TeamMember {
  id: number;
  team: Team;
  user: User;
  joinedAt?: string; // ISO string date
  role: 'LEADER' | 'MEMBER' | 'MENTOR'; // enum values
  teamDiscussions?: TeamDiscussion[];
}
