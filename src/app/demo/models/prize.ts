import { ApplicationStatus } from "./application-status";
import { Hackathon } from "./hackathon";
import { User } from "./user";

export enum PrizeType {
    MONEY = 'MONEY',
    PRODUCT = 'PRODUCT'
  }
  
  export enum PrizeCategory {
    BEST_INNOVATION = 'BEST_INNOVATION',
    BEST_DESIGN = 'BEST_DESIGN',
    BEST_AI_PROJECT = 'BEST_AI_PROJECT'
  }

  
  export interface Prize {
    id?: number;
    sponsor?: User;
    hackathon?: Hackathon;
    prizeType: PrizeType;
    amount?: number;
    productName?: string;
    productDescription?: string;
    status?: ApplicationStatus;
    submittedAt?: Date;
    reviewedAt?: Date;
    prizeCategory: PrizeCategory;
  }
  
  export interface SponsorInfoDTO {
    id: number;
    name: string;
    lastname: string;
    companyName: string;
    companyLogo: string;
    websiteUrl: string;
    reputationPoints: number;
    badge: string;
    badgeIcon: string;
  }