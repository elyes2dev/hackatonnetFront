import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { SponsorApplication } from 'src/app/demo/models/sponsor-application';
import { FileUploadService } from 'src/app/demo/services/file-upload.service';
import { SponsorApplicationService } from 'src/app/demo/services/sponsor-application.service';
import { Table } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-sponsor-applications-list',
  templateUrl: './sponsor-application-list.component.html',
  styleUrls: ['./sponsor-application-list.component.scss']
})
export class SponsorApplicationListComponent implements OnInit {
  @ViewChild('dt1') table!: Table;
  @ViewChild('pdfTable') pdfTable!: ElementRef;
  
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
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load applications. Please try again later.'
        });
      }
    });
  }

  refreshApplications(): void {
    this.loadApplications();
  }
  
  // Helper method to safely format dates
  getFormattedDate(dateValue: string | Date | undefined): string {
    if (!dateValue) return 'Not available';
    return new Date(dateValue).toLocaleString();
  }
  
  // Method to export table data to PDF
  exportPDF(): void {
    if (this.loading) {
      this.messageService.add({
        severity: 'info',
        summary: 'Please wait',
        detail: 'Data is still loading. Please try again after it completes.'
      });
      return;
    }
    
    if (this.filteredApplications.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No data',
        detail: 'There is no data to export.'
      });
      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Generating PDF',
      detail: 'Please wait while we generate your PDF.'
    });

    // Target the table element
    const tableElement = document.querySelector('.p-datatable') as HTMLElement;
    
    if (!tableElement) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not find table element to export.'
      });
      return;
    }

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add title
    pdf.setFontSize(18);
    pdf.text('Sponsor Applications', 14, 15);
    pdf.setFontSize(11);
    pdf.text(`Generated on ${new Date().toLocaleString()}`, 14, 25);
    
    // Set initial y position
    let yPos = 35;
    
    // Function to add a new page if needed
    const checkNewPage = (y: number, height: number): number => {
      if (y + height > 280) {
        pdf.addPage();
        return 20; // Reset to top of new page with some margin
      }
      return y;
    };
    
    // Add table data manually to have better control
    const addApplicationToTable = (app: SponsorApplication, startY: number): number => {
      let y = startY;
      
      // Headers for this application row
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      
      y = checkNewPage(y, 40);
      
      // Draw cells
      pdf.rect(14, y, 182, 10, 'S');
      pdf.text(`ID: ${app.id}`, 16, y + 6);
      
      y += 10;
      y = checkNewPage(y, 10);
      
      pdf.rect(14, y, 182, 10, 'S');
      pdf.text(`Company: ${app.companyName}`, 16, y + 6);
      
      y += 10;
      y = checkNewPage(y, 10);
      
      pdf.rect(14, y, 182, 10, 'S');
      pdf.text(`Registration #: ${app.registrationNumber}`, 16, y + 6);
      
      y += 10;
      y = checkNewPage(y, 10);
      
      pdf.rect(14, y, 182, 10, 'S');
      pdf.text(`Status: ${app.status}`, 16, y + 6);
      
      y += 10;
      y = checkNewPage(y, 10);
      
      pdf.rect(14, y, 182, 10, 'S');
      pdf.text(`Submitted: ${this.getFormattedDate(app.submittedAt)}`, 16, y + 6);
      
      y += 10;
      y = checkNewPage(y, 10);
      
      pdf.rect(14, y, 182, 10, 'S');
      const reviewedText = app.reviewedAt 
        ? `Reviewed: ${this.getFormattedDate(app.reviewedAt)}`
        : 'Reviewed: Not reviewed yet';
      pdf.text(reviewedText, 16, y + 6);
      
      y += 20; // Add some space between application entries
      
      return y;
    };
    
    // Add each application to the PDF
    for (const app of this.filteredApplications) {
      yPos = addApplicationToTable(app, yPos);
      
      // Add some space between applications
      yPos += 5;
      yPos = checkNewPage(yPos, 10);
    }
    
    // Save the PDF
    pdf.save('sponsor-applications.pdf');
    
    this.messageService.add({
      severity: 'success',
      summary: 'PDF Generated',
      detail: 'Your PDF has been generated successfully.'
    });
  }
  
  // Additional methods for PrimeNG table
  clear(table: Table): void {
    table.clear();
    this.statusFilter = 'all';
    this.filteredApplications = [...this.applications];
  }
  
  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

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
      return 'assets/demo/images/galleria/galleria1.jpg';
    }
    return this.fileUploadService.getFileUrl(filename);
  }
  
  deleteApplication(id: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this sponsor application?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.sponsorService.deleteApplication(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Sponsor application deleted successfully'
            });
            this.refreshApplications(); // Reload the applications list
          },
          error: (error) => {
            console.error('Error deleting application', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete sponsor application'
            });
          }
        });
      }
    });
  }
}