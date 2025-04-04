// src/app/components/prize-list/prize-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ApplicationStatus } from 'src/app/demo/models/application-status';
import { Prize } from 'src/app/demo/models/prize';
import { PrizeService } from 'src/app/demo/services/prize.service';

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

  constructor(private prizeService: PrizeService) { }

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
}