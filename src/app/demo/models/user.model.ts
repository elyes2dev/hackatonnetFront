


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
    skills?: Skill[];
    roles?: Role[];

    // New fields for mentorship
  mentorPoints?: number;
  badge: string;
}
