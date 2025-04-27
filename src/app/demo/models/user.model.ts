import { Workshop } from "./workshop.model";

export interface Role {
  id: number;
  name: string;
}

export interface Skill {
  id: number;
  name: string;
}

export interface Hackathon {
  id: number;
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
}

export interface SponsorApplication {
  id: number;
  companyName: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SponsorReward {
  id: number;
  rewardName: string;
  description?: string;
  claimedAt?: Date;
}

export interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  birthdate: Date | null;
  picture: string;  // Add the picture field
  description: string;
  score?: number;
  createdAt?: Date;
  workshops?: Workshop[];
  skills?: Skill[];
  roles?: Role[];

  mentorPoints?: number;
  badge: string;

  monitorPoints?: number; // Corrected name from template
  hackathons?: Hackathon[];

  sponsorApplication?: SponsorApplication;
  sponsorReward?: SponsorReward;

  // Add these missing fields:
  phone?: string;
  location?: string;
  hackathonsJoined?: number;
  projectsSubmitted?: number;
  achievementsCount?: number;
}

