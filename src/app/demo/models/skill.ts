import { User } from "./user";

export enum SkillLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    EXPERT = 'EXPERT'
    // Add other enum values as needed
  }
  
  export interface Skill {
    id?: number;
    name: string;
    level?: SkillLevel;
    users?: User[];
  }