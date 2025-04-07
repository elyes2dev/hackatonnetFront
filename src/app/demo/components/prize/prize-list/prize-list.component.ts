import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ApplicationStatus } from 'src/app/demo/models/application-status';
import { Prize } from 'src/app/demo/models/prize';
import { PrizeService } from 'src/app/demo/services/prize.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-prize-list',
  templateUrl: './prize-list.component.html',
  styleUrls: ['./prize-list.component.scss']
})
export class PrizeListComponent implements OnInit {
  prizes: Prize[] = [];
  loading = true;
  error = '';
  statusOptions: any[] = [];

  constructor(
    private prizeService: PrizeService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadPrizes();
    this.setupStatusOptions();
  }

  loadPrizes(): void {
    this.loading = true;
    this.prizeService.getAllPrizes().subscribe({
      next: (data) => {
        this.prizes = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load prizes. Please try again later.';
        console.error('Error loading prizes:', err);
        this.loading = false;
      }
    });
  }

  setupStatusOptions() {
    // Use your ApplicationStatus enum
    this.statusOptions = [
      { label: 'Approved', value: ApplicationStatus.APPROVED },
      { label: 'Rejected', value: ApplicationStatus.REJECTED },
      { label: 'Pending', value: ApplicationStatus.PENDING },
      { label: 'Canceled', value: ApplicationStatus.CANCELED }
    ];
  }

  clear(table: Table) {
    table.clear();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'status-secondary';
    
    // Convert to lowercase for CSS class naming
    const statusLower = status.toLowerCase();
    
    switch (status) {
      case ApplicationStatus.APPROVED:
        return 'status-approved'; 
      case ApplicationStatus.REJECTED:
        return 'status-rejected';
      case ApplicationStatus.PENDING:
        return 'status-pending';
      case ApplicationStatus.CANCELED:
        return 'status-canceled';
      default:
        return 'status-secondary';
    }
  }

  deletePrize(id: number | undefined): void {
    if (!id) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid prize ID' });
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this prize?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.prizeService.deletePrize(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Prize deleted successfully' });
            this.loadPrizes(); // Reload the prizes after deletion
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete prize' });
            console.error('Error deleting prize:', err);
            this.loading = false;
          }
        });
      }
    });
  }
}