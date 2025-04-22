import { ApplicationStatus } from "./application-status";
import { User } from "./user";

export interface SponsorApplication {
    id?: number;
  user?: User;
  companyName: string;
  companyLogo?: string; // Will store file path
  documentPath?: string; // Will store file path
  registrationNumber: number;
  websiteUrl: string;
  notified?: boolean;
  status?: ApplicationStatus;
  submittedAt?: Date;
  reviewedAt?: Date;
}
