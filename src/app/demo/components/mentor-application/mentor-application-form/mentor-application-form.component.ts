import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ApplicationStatus, MentorApplication } from 'src/app/demo/models/mentor-application.model';
import { PreviousExperience } from 'src/app/demo/models/previous-experience.model';
import { User } from 'src/app/demo/models/user.model';
import { MentorApplicationService } from 'src/app/demo/services/mentor-application.service';
import { PreviousExperienceService } from 'src/app/demo/services/previous-experience.service';

@Component({
  selector: 'app-mentor-application-form',
  templateUrl: './mentor-application-form.component.html',
  styleUrls: ['./mentor-application-form.component.scss'],
  providers: [MessageService]
})
export class MentorApplicationFormComponent implements OnInit {
  applicationForm: FormGroup;
  cvFile: File | null = null;
  uploadPaperFile: File | null = null;
  submitting = false;
  errorMessage: string | null = null;
  applicationStatus = ApplicationStatus;

  constructor(
    private fb: FormBuilder,
    private mentorAppService: MentorApplicationService,
    private previousExperienceService: PreviousExperienceService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.applicationForm = this.fb.group({
      applicationText: ['', [Validators.required, Validators.minLength(100)]],
      links: this.fb.array([this.fb.control('', Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/))]),
      hasPreviousExperience: [false],
      previousExperiences: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.setupFormListeners();
  }

  private setupFormListeners(): void {
    this.applicationForm.get('hasPreviousExperience')?.valueChanges.subscribe(value => {
      if (value) {
        if (this.previousExperiences.length === 0) {
          this.addExperience();
        }
      } else {
        this.clearExperiences();
      }
    });
  }

  get links(): FormArray {
    return this.applicationForm.get('links') as FormArray;
  }

  get previousExperiences(): FormArray {
    return this.applicationForm.get('previousExperiences') as FormArray;
  }

  // Helper method to safely get a FormGroup from the FormArray
  getFormGroupAt(index: number): FormGroup {
    return this.previousExperiences.at(index) as FormGroup;
  }

  addLink(): void {
    this.links.push(this.fb.control('', Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)));
  }

  removeLink(index: number): void {
    this.links.removeAt(index);
  }

  createExperience(): FormGroup {
    return this.fb.group({
      hackathonName: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(2000), Validators.max(new Date().getFullYear())]],
      description: ['', Validators.required],
      numberOfTeamsCoached: ['', [Validators.required, Validators.min(1)]]
    });
  }

  addExperience(): void {
    this.previousExperiences.push(this.createExperience());
  }

  removeExperience(index: number): void {
    this.previousExperiences.removeAt(index);
  }

  clearExperiences(): void {
    while (this.previousExperiences.length !== 0) {
      this.previousExperiences.removeAt(0);
    }
  }

  onCvFileChange(event: any): void {
    if (event.files && event.files.length > 0) {
      this.cvFile = event.files[0];
    }
  }

  onUploadPaperFileChange(event: any): void {
    if (event.files && event.files.length > 0) {
      this.uploadPaperFile = event.files[0];
    }
  }

  onSubmit(): void {
    if (this.applicationForm.invalid || !this.cvFile) {
      this.errorMessage = 'Please fill all required fields and upload your CV';
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: this.errorMessage
      });
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const formValue = this.applicationForm.value;
    
    // Create the application object
    const application: MentorApplication = {
      applicationText: formValue.applicationText,
      links: formValue.links.filter((link: string) => link), // Filter out empty links
      hasPreviousExperience: formValue.hasPreviousExperience,
      status: ApplicationStatus.PENDING,
      previousExperiences: [], // Empty array as we will handle previous experiences separately
      user: {} as User, // Replace with actual user from your auth service
      cv: '', // Will be set by the backend
      uploadPaper: '' // Will be set by the backend if file is uploaded
    };

    // Log the application object to verify the data
    console.log('Application data being sent:', application);

    this.mentorAppService.createApplication(application, this.cvFile, this.uploadPaperFile || undefined)
      .subscribe({
        next: (createdApp) => {
          if (formValue.hasPreviousExperience && this.previousExperiences.length > 0) {
            this.savePreviousExperiences(createdApp.id!);
          } else {
            this.handleSuccessfulSubmission(createdApp.id!);
          }
        },
        error: (err) => {
          this.handleSubmissionError(err);
        }
      });
  }

  private savePreviousExperiences(applicationId: number): void {
    const experiences = this.previousExperiences.value as PreviousExperience[];
    const requests = experiences.map(exp => this.previousExperienceService.createExperience(applicationId, exp));
    
    // Create a counter to track completed requests
    let completedRequests = 0;
    let hasError = false;

    requests.forEach(request => {
      request.subscribe({
        next: () => {
          completedRequests++;
          if (completedRequests === requests.length && !hasError) {
            this.handleSuccessfulSubmission(applicationId);
          }
        },
        error: (err) => {
          if (!hasError) {
            hasError = true;
            this.handleSubmissionError(err);
          }
        }
      });
    });

    // If there are no experiences to save, consider it successful
    if (requests.length === 0) {
      this.handleSuccessfulSubmission(applicationId);
    }
  }

  private handleSuccessfulSubmission(applicationId: number): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Application submitted successfully!'
    });
    this.submitting = false;
    this.router.navigate(['/mentor-applications', applicationId]);
  }

  private handleSubmissionError(err: any): void {
    console.error('Error submitting application:', err);
    this.errorMessage = 'Error submitting application. Please try again.';
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: this.errorMessage
    });
    this.submitting = false;
  }
}