import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SponsorApplication } from 'src/app/demo/models/sponsor-application';
import { FileUploadService } from 'src/app/demo/services/file-upload.service';
import { SponsorApplicationService } from 'src/app/demo/services/sponsor-application.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-sponsor-application-detail',
  templateUrl: './sponsor-application-detail.component.html',
  styleUrls: ['./sponsor-application-detail.component.scss']
})
export class SponsorApplicationDetailComponent implements OnInit {
  applicationId: number = 0;
  application: SponsorApplication | null = null;
  loading = false;
  isProcessing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sponsorService: SponsorApplicationService,
    private fileUploadService: FileUploadService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.applicationId = +id;
        this.loadApplicationDetails();
      }
    });
  }

  loadApplicationDetails(): void {
    this.loading = true;
    this.sponsorService.getApplicationById(this.applicationId).subscribe({
      next: (data) => {
        this.application = data;
        console.log('Application data:', JSON.stringify(data, null, 2));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading application details', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load application details. Please try again later.'
        });
      }
    });
  }

  confirmAction(action: 'approve' | 'reject' | 'ai-verify'): void {
    const actionMessages = {
      'approve': 'approve',
      'reject': 'reject',
      'ai-verify': 'AI verify'
    };

    this.confirmationService.confirm({
      message: `Are you sure you want to ${actionMessages[action]} this sponsor application?`,
      header: 'Confirm Action',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (action === 'approve') {
          this.approveApplication();
        } else if (action === 'reject') {
          this.rejectApplication();
        } else if (action === 'ai-verify') {
          this.aiVerifyApplication();
        }
      }
    });
  }

  approveApplication(): void {
    this.isProcessing = true;
    this.sponsorService.approveApplication(this.applicationId).subscribe({
      next: (data) => {
        this.application = data;
        this.isProcessing = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Application approved successfully!'
        });
      },
      error: (error) => {
        console.error('Error approving application', error);
        this.isProcessing = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to approve application. Please try again later.'
        });
      }
    });
  }

  rejectApplication(): void {
    this.isProcessing = true;
    this.sponsorService.rejectApplication(this.applicationId).subscribe({
      next: (data) => {
        this.application = data;
        this.isProcessing = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Application rejected successfully!'
        });
      },
      error: (error) => {
        console.error('Error rejecting application', error);
        this.isProcessing = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reject application. Please try again later.'
        });
      }
    });
  }

  aiVerifyApplication(): void {
    this.isProcessing = true;
    this.sponsorService.aiVerifyApplication(this.applicationId).subscribe({
      next: (response) => {
        this.isProcessing = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response
        });
        // Reload the application to reflect the new status
        this.loadApplicationDetails();
      },
      error: (error) => {
        console.error('Error during AI verification', error);
        this.isProcessing = false;
        
        // Extracting the error message from the response
        let errorMessage = 'Failed to verify application. Please try again later.';
        
        if (error.error && error.error.message) {
          // If the error object has a nested message property
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          // If error.error is just a string
          errorMessage = error.error;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Verification Failed',
          detail: errorMessage
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/sponsor-application']);
  }

  getCompanyLogoUrl(): string {
    if (!this.application?.companyLogo) {
      return 'assets/images/logo-placeholder.png';
    }
    return this.fileUploadService.getFileUrl(this.application.companyLogo);
  }

  downloadDocument(): void {
    if (!this.application?.documentPath) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No document available'
      });
      return;
    }
    
    // Extract the filename from the path
    const filename = this.application.documentPath.split('/').pop();
    if (!filename) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid document path'
      });
      return;
    }
    this.fileUploadService.downloadFile(filename).subscribe({
      next: (blob: Blob) => {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a link element
        const a = document.createElement('a');
        a.href = url;
        a.download = filename; // Set the filename for download
        
        // Append to the document, click it and remove it
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Show success message
        this.messageService.add({
          severity: 'info',
          summary: 'Success',
          detail: 'Document download started'
        });
      },
      error: (error) => {
        console.error('Error downloading document', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to download document. Please try again later.'
        });
      }
    });
  }
}