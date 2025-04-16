import { Workshop } from "./workshop.model";



export interface Role {
    id?: number;
    name: string;
  }

  export interface Skill {
    id: number;
    name: string;
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
    // Additional properties can be added as needed
}
