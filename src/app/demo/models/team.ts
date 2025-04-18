import { Hackathon } from './hackathon';
import { TeamMember } from './team-members';

export interface Team {
  id: number;
  teamName: string;
  teamCode: string;
  isPublic: boolean;
  isFull: boolean;
  createdAt: string; // ISO date string format
  hackathon: Hackathon;
  teamMembers: TeamMember[];
}
