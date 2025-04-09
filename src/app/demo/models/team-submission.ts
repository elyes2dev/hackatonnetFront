import { TeamMember } from './team-members';

export interface TeamSubmission {
  id: number;
  teamMember: TeamMember;
  projectName: string;
  description: string;
  repoLink: string;
  submissionDate: string; // ISO string date
}
