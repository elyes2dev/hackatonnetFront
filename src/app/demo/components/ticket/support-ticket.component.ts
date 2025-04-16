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
  ticket: Ticket = { id: 0, userId: this.storageService.getUserId(), description: '', status: '', createdAt: new Date(), updatedAt: new Date() };
  isUpdating: boolean = false;

  constructor(private ticketService: TicketService, private storageService: StorageService) {}

  ngOnInit(): void {
    this.loadAllTickets();
  }

  loadAllTickets(): void {
    this.ticketService.getAllTickets().subscribe((tickets) => this.tickets = tickets);
  }

  populateForm(ticket: Ticket): void {
    this.ticket = { ...ticket };
    this.isUpdating = true;
  }

  onSubmit(): void {
    if (this.isUpdating) {
      this.updateTicket();
    } else {
      this.createTicket();
    }
  }

  createTicket(): void {
    this.ticketService.createTicket(this.ticket).subscribe(() => {
      this.loadAllTickets();
      this.resetForm();
    });
  }

  updateTicket(): void {
    this.ticketService.updateTicket(this.ticket.id, this.ticket).subscribe(() => {
      this.loadAllTickets();
      this.resetForm();
    });
  }

  resetForm(): void {
    this.ticket = { id: 0, userId: this.storageService.getUserId(), description: '', status: '', createdAt: new Date(), updatedAt: new Date() };
    this.isUpdating = false;
  }

  deleteTicket(id: number): void {
    this.ticketService.deleteTicket(id).subscribe(() => this.loadAllTickets());
  }
}
