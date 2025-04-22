import { User } from "./user";

export enum SponsorBadge {
    BRONZE = 'BRONZE',
    SILVER = 'SILVER',
    GOLD = 'GOLD',
    PLATINUM = 'PLATINUM'
  }
  
  export interface SponsorReward {
    id?: number;
    sponsor?: User;
    reputationPoints?: number;
    badge?: SponsorBadge;
    unlockedAt?: Date;
  }
