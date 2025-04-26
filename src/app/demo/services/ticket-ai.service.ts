import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TicketService } from './ticket.service';
import { Ticket } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketAIService {
  constructor(
    private http:HttpClient,
    private ticketService: TicketService
  ) { }

  geTicketDesc(ticket: Ticket){
     let obj = {
      "text" : ticket.description,
     }
      return this.http.post("http://localhost:9100/api/tickets/analyze", obj);
  }



}
