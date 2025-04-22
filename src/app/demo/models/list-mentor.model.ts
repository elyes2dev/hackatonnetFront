
import { Hackathon } from "./hackathon.model";
import { User } from "./user.model";

export interface ListMentor {
    id?: number;
    mentor: User;
    hackathon: Hackathon;
    numberOfTeams: number;
  }
  