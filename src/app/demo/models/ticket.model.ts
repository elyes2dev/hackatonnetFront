import { User } from "./user.model";

export interface Ticket {
  id: number;
  userId: string | null;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  classification: string
}