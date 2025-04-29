import { Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Table } from 'primeng/table';
import { ApplicationStatus, MentorApplication } from 'src/app/demo/models/mentor-application.model';
import { MentorApplicationService } from 'src/app/demo/services/mentor-application.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-mentor-application-list',
  templateUrl: './mentor-application-list.component.html',
  styleUrls: ['./mentor-application-list.component.scss'],
  providers: [DatePipe] // Add DatePipe to the providers
})
export class MentorApplicationListComponent implements OnInit {
  applications: (MentorApplication & { formattedDate: string })[] = [];
  loading = true;
  statuses: any[] = [];
  
  // Add this to make the enum available in the template
  ApplicationStatus = ApplicationStatus;
  
  @ViewChild('dt') table!: Table;

  constructor(
    private mentorApplicationService: MentorApplicationService,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadApplications();
    this.statuses = [
      {label: 'PENDING', value: ApplicationStatus.PENDING},
      {label: 'APPROVED', value: ApplicationStatus.APPROVED},
      {label: 'REJECTED', value: ApplicationStatus.REJECTED}
    ];
  }

  loadApplications() {
    this.loading = true;
    this.mentorApplicationService.getAllApplications().subscribe({
      next: (data) => {
        // Debug: check what you're receiving
        console.log('Applications data:', data);
        console.log('Raw createdAt value example:', data[0]?.createdAt);
        
        // Make sure to handle potentially invalid data
        this.applications = data.map(app => {
          // Create a date object from the timestamp
          const dateObj = app.createdAt ? new Date(app.createdAt) : undefined;
          
          return {
            id: app.id,
            user: app.user || { name: 'Unknown', lastname: '' }, // Ensure user exists
            applicationText: app.applicationText || '',
            cv: app.cv || '',
            uploadPaper: app.uploadPaper || '',
            links: app.links || [],
            hasPreviousExperience: !!app.hasPreviousExperience,
            status: app.status || ApplicationStatus.PENDING,
            previousExperiences: app.previousExperiences || [],
            createdAt: dateObj,
            // Format the date using DatePipe
            formattedDate: dateObj ? this.datePipe.transform(dateObj, 'MM/dd/yyyy') || 'N/A' : 'N/A'
          };
        });
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading applications:', err);
        this.loading = false;
      }
    });
  }

  confirmAction(action: 'approve' | 'reject', id: number): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} this mentor application?`,
      header: 'Confirm Action',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (action === 'approve') {
          this.updateStatus(id, ApplicationStatus.APPROVED);
        } else {
          this.updateStatus(id, ApplicationStatus.REJECTED);
        }
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }

  updateStatus(id: number, status: ApplicationStatus) {
    this.mentorApplicationService.updateApplicationStatus(id, status).subscribe({
      next: (updatedApplication) => {
        // Find and update the application in the local array
        const index = this.applications.findIndex(app => app.id === id);
        if (index !== -1) {
          const dateObj = updatedApplication.createdAt ? new Date(updatedApplication.createdAt) : undefined;
          this.applications[index] = {
            ...updatedApplication,
            formattedDate: dateObj ? this.datePipe.transform(dateObj, 'MM/dd/yyyy') || 'N/A' : 'N/A'
          };
        }
      },
      error: (err) => console.error('Error updating status:', err)
    });
  }

  private updateApplicationStatusLocally(id: number, status: ApplicationStatus): void {
    const application = this.applications.find(app => app.id === id);
    if (application) {
      application.status = status;
    }
  }
}