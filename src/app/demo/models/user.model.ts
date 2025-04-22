import { Workshop } from "./workshop.model";

export interface Role {
  id?: number;
  name: string;
}

export interface Skill {
  id: number;
  name: string;
}

export interface Hackathon {
  id: number;
  title: string;
  // Add more fields as needed
}

export interface SponsorApplication {
  // Define structure if known, or leave as any for now
  [key: string]: any;
}

export interface SponsorReward {
  // Define structure if known, or leave as any for now
  [key: string]: any;
}

export interface User {
  id?: number;
  name: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  birthdate: Date | null;
  picture: string;
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
}
