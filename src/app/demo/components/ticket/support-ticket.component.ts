import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ticket } from '../../models/ticket.model';
import { TicketService } from '../../services/ticket.service';
import { StorageService } from '../../services/storage.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../../services/user.service';
import { TicketAIService } from '../../services/ticket-ai.service';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-support-ticket',
  templateUrl: './support-ticket.component.html',
  styleUrls: ['./support-ticket.component.css']
})
export class SupportTicketComponent implements OnInit {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  ticketForm!: FormGroup;
  
  isUpdating: boolean = false;
  loading: boolean = false;

  
  
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
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private userService: UserService,
    private ticketAIService: TicketAIService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAllTickets();
  }

  initForm(): void {
    this.ticketForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['Open', Validators.required],
      
    });
  }

  loadAllTickets(): void {
    this.loading = true;
    this.ticketService.getAllTickets().subscribe({
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
    /*
    const ticketData: Ticket = {
      ...formData,
      user: this.userService.getUserById(this.storageService.getLoggedInUserId()),
      updatedAt: new Date()
    };
    console.log(ticketData);
    if (this.isUpdating) {
      this.updateTicket(ticketData);
    } else {
      this.createTicket(ticketData);
    }*/
      this.userService.getUserById(this.storageService.getLoggedInUserId()).subscribe({
        next: req => { const ticketData: Ticket = {
          ...formData,
          userId: req.id,
          updatedAt: new Date()
        };
        console.log(ticketData);
    if (this.isUpdating) {
      this.updateTicket(ticketData);
    } else {
      this.createTicket(ticketData);
    }
      },
        error : err => { console.log(err)},
        complete : () => {console.log("complete")}        
      });

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
        this.ticketAIService.geTicketDesc(newTicket).subscribe({
          next: (req) => {
            console.log(req);
          },
          error: (err) => {
            console.error(err);
          },
          complete: () => {
            console.log("AI description retrieval complete");
          }
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
    
    this.ticketService.updateTicket(ticketId, ticketData).subscribe({
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

  confirmDelete(ticket: Ticket): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this support ticket?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteTicket(ticket.id);
      }
    });
  }

  deleteTicket(id: number): void {
    this.loading = true;
    this.ticketService.deleteTicket(id).subscribe({
      next: () => {
        this.tickets = this.tickets.filter(t => t.id !== id);
        this.filterTickets();
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Ticket deleted successfully'
        });
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete ticket'
        });
      }
    });
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
}
