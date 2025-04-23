import { Hackathon } from './hackathon';
import { TeamMember } from './team-members';
import { TeamDiscussion } from './team-discussion';

export interface Team {
  id: number;
  teamName: string;
  teamCode: string;
  isPublic: boolean;
  isFull: boolean;
  joinCodeExpirationTime?: string; // ISO date string format
  createdAt?: string; // ISO date string format
  hackathon?: Hackathon;
  teamMembers?: TeamMember[];
  teamDiscussions?: TeamDiscussion[];
}
