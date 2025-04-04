// src/app/sponsor-application-detail/sponsor-application-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SponsorApplication } from 'src/app/demo/models/sponsor-application';
import { FileUploadService } from 'src/app/demo/services/file-upload.service';
import { SponsorApplicationService } from 'src/app/demo/services/sponsor-application.service';

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
    private fileUploadService: FileUploadService
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
        alert('Failed to load application details. Please try again later.');
      }
    });
  }

  approveApplication(): void {
    if (confirm('Are you sure you want to approve this application?')) {
      this.isProcessing = true;
      this.sponsorService.approveApplication(this.applicationId).subscribe({
        next: (data) => {
          this.application = data;
          this.isProcessing = false;
          alert('Application approved successfully!');
        },
        error: (error) => {
          console.error('Error approving application', error);
          this.isProcessing = false;
          alert('Failed to approve application. Please try again later.');
        }
      });
    }
  }

  rejectApplication(): void {
    if (confirm('Are you sure you want to reject this application?')) {
      this.isProcessing = true;
      this.sponsorService.rejectApplication(this.applicationId).subscribe({
        next: (data) => {
          this.application = data;
          this.isProcessing = false;
          alert('Application rejected successfully!');
        },
        error: (error) => {
          console.error('Error rejecting application', error);
          this.isProcessing = false;
          alert('Failed to reject application. Please try again later.');
        }
      });
    }
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
      alert('No document available');
      return;
    }
    
    // Extract the filename from the path
    const filename = this.application.documentPath.split('/').pop();
    if (!filename) {
      alert('Invalid document path');
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
      },
      error: (error) => {
        console.error('Error downloading document', error);
        alert('Failed to download document. Please try again later.');
      }
    });
  }
}