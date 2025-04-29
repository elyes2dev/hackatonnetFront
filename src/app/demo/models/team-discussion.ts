import { Team } from './team';
import { TeamMember } from './team-members';

export interface TeamDiscussion {
  id: number;
  message: string;
  team?: Team;
  teamMember?: TeamMember;
  messageType?: MessageType;
  isRead?: boolean;
  isPinned?: boolean;
  createdAt?: string; // ISO string date
  isAI?: boolean; // Flag to identify AI-generated messages
  isLoading?: boolean; // Flag to indicate if message is in loading state
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  EMOJI = 'EMOJI'
}
