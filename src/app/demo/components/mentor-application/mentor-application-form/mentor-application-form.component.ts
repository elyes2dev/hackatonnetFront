import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ApplicationStatus, MentorApplication } from 'src/app/demo/models/mentor-application.model';
import { PreviousExperience } from 'src/app/demo/models/previous-experience.model';
import { User } from 'src/app/demo/models/user.model';
import { MentorApplicationService } from 'src/app/demo/services/mentor-application.service';
import { PreviousExperienceService } from 'src/app/demo/services/previous-experience.service';
import { switchMap, of, forkJoin, tap, catchError, finalize } from 'rxjs';

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
  loading = false;
  errorMessage: string | null = null;
  applicationStatus = ApplicationStatus;
  
  // Edit mode properties
  isEditMode = false;
  applicationId: number | null = null;
  existingApplication: MentorApplication | null = null;
  
  // For displaying existing files
  existingCvFileName: string | null = null;
  existingPaperFileName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private mentorAppService: MentorApplicationService,
    private previousExperienceService: PreviousExperienceService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
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
    
    // Check if we're in edit mode by examining the route parameters
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.applicationId = +params['id'];
        this.loadExistingApplication(this.applicationId);
      }
    });
  }

  private loadExistingApplication(id: number): void {
    this.loading = true;
    
    forkJoin([
      this.mentorAppService.getApplicationById(id),
      this.previousExperienceService.getExperiencesByApplicationId(id)
    ]).pipe(
      tap(([application, experiences]) => {
        this.existingApplication = application;
        
        // Set file names
        if (application.cv) {
          this.existingCvFileName = this.extractFileName(application.cv);
        }
        
        if (application.uploadPaper) {
          this.existingPaperFileName = this.extractFileName(application.uploadPaper);
        }
        
        // Populate the form
        this.applicationForm.patchValue({
          applicationText: application.applicationText,
          hasPreviousExperience: application.hasPreviousExperience
        });
        
        // Handle links
        this.clearLinks();
        if (application.links && application.links.length > 0) {
          application.links.forEach((link, index) => {
            if (index === 0) {
              this.links.at(0).setValue(link);
            } else {
              this.links.push(this.fb.control(link, Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)));
            }
          });
        }
        
        // Handle previous experiences
        this.clearExperiences();
        if (application.hasPreviousExperience && experiences.length > 0) {
          experiences.forEach(exp => {
            const experienceGroup = this.createExperience();
            experienceGroup.patchValue(exp);
            this.previousExperiences.push(experienceGroup);
          });
        }
      }),
      catchError(error => {
        console.error('Error loading application:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load application data. Please try again.'
        });
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe();
  }
  
  private extractFileName(path: string): string {
    // Extract just the filename from a full path
    return path.split('/').pop() || path;
  }

  private setupFormListeners(): void {
    this.applicationForm.get('hasPreviousExperience')?.valueChanges.subscribe(value => {
      console.log('hasPreviousExperience changed to:', value);
      console.log('Current experiences count:', this.previousExperiences.length);
      
      if (value) {
        if (this.previousExperiences.length === 0) {
          console.log('Adding initial experience form');
          this.addExperience();
        }
      } else {
        console.log('Clearing experiences');
        this.clearExperiences();
      }
    });
  }

  get links(): FormArray {
    return this.applicationForm.get('links') as FormArray;
  }
  
  clearLinks(): void {
    while (this.links.length > 0) {
      this.links.removeAt(0);
    }
    this.addLink(); // Add one empty link
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
    // In edit mode, CV may not be required if one exists already
    const isCvRequired = !this.isEditMode || !this.existingCvFileName;
    
    if (this.applicationForm.invalid || (isCvRequired && !this.cvFile)) {
      this.errorMessage = 'Please fill all required fields' + (isCvRequired ? ' and upload your CV' : '');
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
      id: this.isEditMode ? this.applicationId! : undefined,
      applicationText: formValue.applicationText,
      links: formValue.links.filter((link: string) => link), // Filter out empty links
      hasPreviousExperience: formValue.hasPreviousExperience,
      status: this.isEditMode ? this.existingApplication?.status || ApplicationStatus.PENDING : ApplicationStatus.PENDING,
      previousExperiences: [], // Empty array as we will handle previous experiences separately
      user: this.isEditMode && this.existingApplication?.user ? this.existingApplication.user : {} as User,
      cv: this.isEditMode && this.existingCvFileName ? this.existingApplication?.cv || '' : '', // Will be set by the backend
      uploadPaper: this.isEditMode && this.existingPaperFileName ? this.existingApplication?.uploadPaper || '' : '' // Will be set by the backend if file is uploaded
    };

    // Log the application object to verify the data
    console.log(`${this.isEditMode ? 'Update' : 'Create'} application data being sent:`, application);

    if (this.isEditMode) {
      this.updateApplication(application);
    } else {
      this.createApplication(application);
    }
  }
  
  private createApplication(application: MentorApplication): void {
    this.mentorAppService.createApplication(application, this.cvFile!, this.uploadPaperFile || undefined)
      .subscribe({
        next: (createdApp) => {
          if (application.hasPreviousExperience && this.previousExperiences.length > 0) {
            this.savePreviousExperiences(createdApp.id!);
          } else {
            this.handleSuccessfulSubmission(createdApp.id!, 'created');
          }
        },
        error: (err) => {
          this.handleSubmissionError(err);
        }
      });
  }
  
  private updateApplication(application: MentorApplication): void {
    console.log('Updating application:', application);
    
    // Create FormData for update - similar to create method for consistency
    const formData = new FormData();
    
    // Add each field individually
    formData.append('applicationText', application.applicationText);
    
    // For arrays like links, use indexed notation
    if (application.links && application.links.length > 0) {
      application.links.forEach((link, index) => {
        formData.append(`links[${index}]`, link);
      });
    }
    
    formData.append('hasPreviousExperience', application.hasPreviousExperience.toString());
    formData.append('status', application.status);
    
    // Add files if new ones uploaded
    if (this.cvFile) {
      console.log('Uploading new CV file');
      formData.append('cvFile', this.cvFile);
    }
    
    if (this.uploadPaperFile) {
      console.log('Uploading new paper file');
      formData.append('uploadPaperFile', this.uploadPaperFile);
    }
  
    this.mentorAppService.updateApplicationFormData(this.applicationId!, formData)
      .subscribe({
        next: (updatedApp) => {
          console.log('Application updated successfully:', updatedApp);
          
          if (application.hasPreviousExperience) {
            console.log('Handling previous experiences');
            // First delete existing experiences, then save new ones
            this.previousExperienceService.deleteExperiencesByApplicationId(this.applicationId!)
              .pipe(
                tap(() => console.log('Deleted existing experiences')),
                switchMap(() => {
                  if (this.previousExperiences.length > 0) {
                    console.log('Saving new experiences');
                    return of(this.savePreviousExperiences(this.applicationId!));
                  }
                  console.log('No experiences to save');
                  return of(this.handleSuccessfulSubmission(this.applicationId!, 'updated'));
                }),
                catchError(err => {
                  console.error('Error handling experiences:', err);
                  this.handleSubmissionError(err);
                  return of(null);
                })
              )
              .subscribe();
          } else {
            // If no previous experience, just delete any existing ones
            console.log('No previous experience selected, deleting any existing ones');
            this.previousExperienceService.deleteExperiencesByApplicationId(this.applicationId!)
              .subscribe({
                next: () => this.handleSuccessfulSubmission(this.applicationId!, 'updated'),
                error: (err) => this.handleSubmissionError(err)
              });
          }
        },
        error: (err) => {
          this.handleSubmissionError(err);
        }
      });
  }

  private savePreviousExperiences(applicationId: number): void {
    const experiences = this.previousExperiences.value as PreviousExperience[];
    console.log('Saving experiences:', experiences);
    
    const requests = experiences.map(exp => {
      console.log('Creating experience:', exp);
      return this.previousExperienceService.createExperience(applicationId, exp);
    });
    
    // If there are no experiences to save, consider it successful
    if (requests.length === 0) {
      console.log('No experiences to save');
      this.handleSuccessfulSubmission(applicationId, this.isEditMode ? 'updated' : 'created');
      return;
    }
    
    // Use forkJoin to handle multiple requests
    forkJoin(requests)
      .subscribe({
        next: (results) => {
          console.log('All experiences saved successfully:', results);
          this.handleSuccessfulSubmission(applicationId, this.isEditMode ? 'updated' : 'created');
        },
        error: (err) => {
          console.error('Error saving experiences:', err);
          this.handleSubmissionError(err);
        }
      });
  }

  private handleSuccessfulSubmission(applicationId: number, action: 'created' | 'updated'): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `Application ${action} successfully!`
    });
    this.submitting = false;
    this.router.navigate(['/mentor-applications', applicationId]);
  }

  private handleSubmissionError(err: any): void {
    console.error(`Error ${this.isEditMode ? 'updating' : 'submitting'} application:`, err);
    this.errorMessage = `Error ${this.isEditMode ? 'updating' : 'submitting'} application. Please try again.`;
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: this.errorMessage
    });
    this.submitting = false;
  }

  // Helper method to check if a file exists
  hasExistingFile(type: 'cv' | 'paper'): boolean {
    return type === 'cv' 
      ? !!this.existingCvFileName 
      : !!this.existingPaperFileName;
  }
  
  // Method to handle cancel action
  onCancel(): void {
    if (this.isEditMode && this.applicationId) {
      this.router.navigate(['/mentor-applications', this.applicationId]);
    } else {
      this.router.navigate(['/mentor-applications']);
    }
  }
}