import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MentorApplication } from 'src/app/demo/models/mentor-application.model';
import { PreviousExperience } from 'src/app/demo/models/previous-experience.model';
import { MentorApplicationService } from 'src/app/demo/services/mentor-application.service';
import { PreviousExperienceService } from 'src/app/demo/services/previous-experience.service';
import { Location } from '@angular/common';  // Add this import


@Component({
  selector: 'app-mentor-application-details-admin',
  templateUrl: './mentor-application-details-admin.component.html',
  styleUrls: ['./mentor-application-details-admin.component.scss']
})
export class MentorApplicationDetailsAdminComponent implements OnInit {
  application: MentorApplication | undefined;
  previousExperiences: PreviousExperience[] = [];

  loading = true;


  constructor(
    private route: ActivatedRoute,
    private applicationService: MentorApplicationService,
    private experienceService: PreviousExperienceService,
    private location: Location
  ) {}

  ngOnInit(): void {
    console.log('MentorApplicationDetailsAdminComponent initialized');
    this.route.params.subscribe(params => {
      const id = +params['id'];
      console.log('Route ID parameter:', id);
      this.loadApplication(id);
    });
  }

  loadApplication(id: number): void {
    this.loading = true;
    this.applicationService.getApplicationById(id).subscribe({
      next: (app) => {
        this.application = app;
        this.loadPreviousExperiences(app.id!);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadPreviousExperiences(applicationId: number): void {
    this.experienceService.getExperiencesByApplicationId(applicationId).subscribe({
      next: (experiences) => {
        this.previousExperiences = experiences;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

 

  getStatusSeverity(status: string): string {
    switch(status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'info';
    }
  }
  


  downloadCv(applicationId: number, filename: string): void {
    this.applicationService.downloadCv(applicationId).subscribe(blob => {
      this.downloadFile(blob, filename || 'cv.pdf');
    });
  }
  
  downloadUploadPaper(applicationId: number, filename: string): void {
    this.applicationService.downloadUploadPaper(applicationId).subscribe(blob => {
      this.downloadFile(blob, filename || 'paper.pdf');
    });
  }
  
  private downloadFile(blob: Blob, filename: string): void {
    // Create a blob URL
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    
    // Append to the document
    document.body.appendChild(a);
    
    // Trigger the download
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
