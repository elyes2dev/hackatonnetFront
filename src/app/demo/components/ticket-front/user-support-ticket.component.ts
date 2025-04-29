import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ticket } from '../../models/ticket.model';
import { TicketService } from '../../services/ticket.service';
import { StorageService } from '../../services/storage.service';
import { MessageService } from 'primeng/api';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-user-support-ticket',
  templateUrl: './user-support-ticket.component.html',
  styleUrls: ['./user-support-ticket.component.scss']
})
export class UserSupportTicketComponent implements OnInit {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  ticketForm!: FormGroup;
  
  isUpdating: boolean = false;
  loading: boolean = false;
  
  // Ticket details dialog
  displayTicketDetailsDialog: boolean = false;
  selectedTicketDetails: Ticket | null = null;
  
  statusOptions: DropdownOption[] = [
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' },
    { label: 'Closed', value: 'Closed' }
  ];
  
  filterOptions: DropdownOption[] = [
    { label: 'All Tickets', value: 'All' },
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' },
    { label: 'Closed', value: 'Closed' }
  ];
  
  selectedFilter: string = 'All';
  searchQuery: string = '';

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private storageService: StorageService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUserTickets();
  }

  initForm(): void {
    this.ticketForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['Open', Validators.required],
    });
  }

  loadUserTickets(): void {
    this.loading = true;
    const userId = this.storageService.getLoggedInUserId();
    
    this.ticketService.getTicketsByUser(userId).subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.filterTickets();
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tickets'
        });
        this.loading = false;
      }
    });
  }

  populateForm(ticket: Ticket): void {
    this.isUpdating = true;
    
    this.ticketForm.patchValue({
      description: ticket.description,
      status: ticket.status,
    });
    
    // Store the ticket ID for update
    this.ticketForm.addControl('id', this.fb.control(ticket.id));
  }

  onSubmit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }
    
    this.loading = true;
    const formData = this.ticketForm.value;
    const userId = this.storageService.getLoggedInUserId();
    
    const ticketData: Ticket = {
      ...formData,
      userId: userId,
      updatedAt: new Date()
    };
    
    if (this.isUpdating) {
      this.updateTicket(ticketData);
    } else {
      this.createTicket(ticketData);
    }
  }

  createTicket(ticketData: Ticket): void {
    // Set creation date for new tickets
    ticketData.createdAt = new Date();
    
    this.ticketService.createTicket(ticketData).subscribe({
      next: (newTicket) => {
        this.tickets = [...this.tickets, newTicket];
        this.filterTickets();
        this.resetForm();
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Ticket created successfully'
        });
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create ticket'
        });
      }
    });
  }

  updateTicket(ticketData: Ticket): void {
    const ticketId = ticketData.id;
    
    // Create a clean copy from the form without userId
    const ticketToSend = { ...this.ticketForm.value };
    delete ticketToSend.userId;
  
    // Use ticketToSend instead of ticketData
    this.ticketService.updateTicket(ticketId, ticketToSend).subscribe({
      next: (updatedTicket) => {
        const index = this.tickets.findIndex(t => t.id === ticketId);
        if (index !== -1) {
          this.tickets[index] = updatedTicket;
          this.filterTickets();
        }
        this.resetForm();
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Ticket updated successfully'
        });
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update ticket'
        });
      }
    });
  }

  resetForm(): void {
    this.isUpdating = false;
    this.ticketForm.reset({
      status: 'Open',
    });
    
    // Remove the id control if it exists
    if (this.ticketForm.contains('id')) {
      this.ticketForm.removeControl('id');
    }
  }

  filterTickets(): void {
    if (this.selectedFilter === 'All') {
      this.filteredTickets = [...this.tickets];
    } else {
      this.filteredTickets = this.tickets.filter(ticket => ticket.status === this.selectedFilter);
    }
    
    // Apply search if there's an active search query
    if (this.searchQuery) {
      this.applySearchFilter();
    }
  }

  applySearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value.toLowerCase();
    this.applySearchFilter();
  }

  private applySearchFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filterTickets();
      return;
    }
    
    this.filteredTickets = this.filteredTickets.filter(ticket => 
      ticket.description.toLowerCase().includes(this.searchQuery) ||
      ticket.id.toString().includes(this.searchQuery)
    );
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'Open':
        return 'info';
      case 'In Progress':
        return 'warning';
      case 'Resolved':
        return 'success';
      case 'Closed':
        return 'secondary';
      default:
        return 'info';
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ticketForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  viewTicketDetails(ticket: Ticket): void {
    this.selectedTicketDetails = ticket;
    this.displayTicketDetailsDialog = true;
  }
}