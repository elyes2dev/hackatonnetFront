import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MentorApplication } from 'src/app/demo/models/mentor-application.model';
import { PreviousExperience } from 'src/app/demo/models/previous-experience.model';
import { MentorApplicationService } from 'src/app/demo/services/mentor-application.service';
import { PreviousExperienceService } from 'src/app/demo/services/previous-experience.service';
import { Location } from '@angular/common';
import { StorageService } from 'src/app/demo/services/storage.service';

@Component({
  selector: 'app-mentor-application-details',
  templateUrl: './mentor-application-details.component.html',
  styleUrls: ['./mentor-application-details.component.scss']
})
export class MentorApplicationDetailsComponent implements OnInit {
  application: MentorApplication | undefined;
  previousExperiences: PreviousExperience[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private applicationService: MentorApplicationService,
    private experienceService: PreviousExperienceService,
    private location: Location,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      // Check if we're loading by user ID or application ID
      if (params.has('userId')) {
        const userId = +params.get('userId')!;
        this.loadApplicationByUserId(userId);
      } else if (params.has('id')) {
        const appId = +params.get('id')!;
        this.loadApplicationById(appId);
      } else {
        // Fallback to logged in user if no params (optional)
        const loggedUserId = this.storageService.getLoggedInUserId();
        if (loggedUserId) {
          this.loadApplicationByUserId(loggedUserId);
        } else {
          this.loading = false;
        }
      }
    });
  }

  loadApplicationById(id: number): void {
    this.loading = true;
    this.applicationService.getApplicationById(id).subscribe({
      next: (app) => {
        this.application = app;
        this.loadPreviousExperiences(app.id!);
      },
      error: (err) => {
        console.error('Error loading application:', err);
        this.loading = false;
      }
    });
  }

  loadApplicationByUserId(userId: number): void {
    this.loading = true;
    this.applicationService.getApplicationsByMentorId(userId).subscribe({
      next: (apps) => {
        if (apps && apps.length > 0) {
          this.application = apps[0]; // Get the first (and only) application
          this.loadPreviousExperiences(this.application.id!);
        } else {
          this.application = undefined;
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading application by user ID:', err);
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
      error: (err) => {
        console.error('Error loading previous experiences:', err);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
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
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}