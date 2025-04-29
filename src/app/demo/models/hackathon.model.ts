import { ListMentor } from "./list-mentor.model";

export interface Hackathon {
    id: number;
    title: string
    mentors: ListMentor[];
    startDate: string;



    // other properties
  }
  