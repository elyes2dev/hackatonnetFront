import { User } from "./user";

export interface Hackathon {
    id?: number;
    title: string;
    location: string;
    logo?: string;
    maxMembers: number;
    isOnline?: boolean;
    description: string;
    startDate: Date;
    endDate: Date;
    createdBy: User;
    createdAt?: Date;
  }