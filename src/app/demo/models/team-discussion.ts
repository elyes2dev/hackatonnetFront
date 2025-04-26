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
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  EMOJI = 'EMOJI'
}
