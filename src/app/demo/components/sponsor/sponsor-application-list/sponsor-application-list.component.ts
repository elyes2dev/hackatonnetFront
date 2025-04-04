import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SponsorApplication } from 'src/app/demo/models/sponsor-application';
import { FileUploadService } from 'src/app/demo/services/file-upload.service';
import { SponsorApplicationService } from 'src/app/demo/services/sponsor-application.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-sponsor-applications-list',
  templateUrl: './sponsor-application-list.component.html',
  styleUrls: ['./sponsor-application-list.component.scss']
})
export class SponsorApplicationListComponent implements OnInit {
  applications: SponsorApplication[] = [];
  filteredApplications: SponsorApplication[] = [];
  loading = false;
  statusFilter = 'all';
  
  // Status options for the dropdown filter
  statuses = [
    { label: 'All', value: null },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' }
  ];

  constructor(
    private sponsorService: SponsorApplicationService,
    private fileUploadService: FileUploadService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    this.sponsorService.getAllApplications().subscribe({
      next: (data) => {
        this.applications = data;
        this.filteredApplications = [...this.applications];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading applications', error);
        this.loading = false;
        alert('Failed to load applications. Please try again later.');
      }
    });
  }

  refreshApplications(): void {
    this.loadApplications();
  }
  
  // Additional methods for PrimeNG table
  
  /**
   * Clears all filters in the table
   * @param table PrimeNG Table reference
   */
  clear(table: Table): void {
    table.clear();
    this.statusFilter = 'all';
    this.filteredApplications = [...this.applications];
  }
  
  /**
   * Handles global filtering across multiple columns
   * @param table PrimeNG Table reference
   * @param event Input event
   */
  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  /**
   * Legacy method kept for backward compatibility
   * PrimeNG table handles filtering internally
   */
  applyFilters(): void {
    if (this.statusFilter === 'all') {
      this.filteredApplications = [...this.applications];
    } else {
      this.filteredApplications = this.applications.filter(app => 
        app.status === this.statusFilter);
    }
  }

  viewDetails(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/sponsor-application', id]);
    }
  }

  getLogoUrl(filename: string | null | undefined): string {
    if (!filename) {
      return 'assets/images/logo-placeholder.png';
    }
    return this.fileUploadService.getFileUrl(filename);
  }
}