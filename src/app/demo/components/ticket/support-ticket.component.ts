import { Component, OnInit } from '@angular/core';
import { Ticket } from '../../models/ticket.model';
import { TicketService } from '../../services/ticket.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-support-ticket',
  templateUrl: './support-ticket.component.html',
  styleUrls: ['./support-ticket.component.css']
})
export class SupportTicketComponent implements OnInit {
  tickets: Ticket[] = [];
  ticket: Ticket = { id: 0, userId: this.storageservice.getUserId(), description: '', status: '', createdAt: new Date(), updatedAt: new Date() };

  constructor(private ticketService: TicketService,private storageservice: StorageService) {}

  ngOnInit(): void {
    this.loadAllTickets();
  }

  loadAllTickets(): void {
    this.ticketService.getAllTickets().subscribe((tickets) => this.tickets = tickets);
  }

  createTicket(): void {
    this.ticketService.createTicket(this.ticket).subscribe(() => this.loadAllTickets());
  }

  updateTicket(): void {
    this.ticketService.updateTicket(this.ticket.id, this.ticket).subscribe(() => this.loadAllTickets());
  }

  deleteTicket(id: number): void {
    this.ticketService.deleteTicket(id).subscribe(() => this.loadAllTickets());
  }
}