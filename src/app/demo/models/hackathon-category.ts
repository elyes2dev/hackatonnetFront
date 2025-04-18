import { Hackathon } from "./hackathon";

export interface HackathonCategory {
    id: number;
    name: string;
    description: string;
    count?: number; // For analytics
  }
  
  export enum CategoryType {
    THEME = 'THEME',        // e.g., Healthcare, Education, Fintech
    AUDIENCE = 'AUDIENCE',  // e.g., Students, Professionals, Beginners
    TECH = 'TECH'           // e.g., AI/ML, Blockchain, Mobile
  }
  
  export interface HackathonWithCategories extends Hackathon {
    categories?: {
      theme?: string[];
      audience?: string[];
      tech?: string[];
    };
  }