import { Team } from './team';
import { User } from './user';
import { TeamDiscussion } from './team-discussion';
import { TeamSubmission } from './team-submission';

export interface TeamMember {
  id: number;
  team: Team;
  user: User;
  joinedAt: string; // ISO string date
  role: 'LEADER' | 'MEMBER' | 'MENTOR'; // enum values
  teamDiscussions: TeamDiscussion[];
  teamSubmission: TeamSubmission;
}
