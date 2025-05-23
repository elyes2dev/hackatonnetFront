import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ApplicationStatus, MentorApplication } from 'src/app/demo/models/mentor-application.model';
import { PreviousExperience } from 'src/app/demo/models/previous-experience.model';
import { User } from 'src/app/demo/models/user.model';
import { MentorApplicationService } from 'src/app/demo/services/mentor-application.service';
import { PreviousExperienceService } from 'src/app/demo/services/previous-experience.service';
import { StorageService } from 'src/app/demo/services/storage.service'; // Import StorageService
import { switchMap, of, forkJoin, tap, catchError, finalize, EMPTY, map } from 'rxjs';

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
    private route: ActivatedRoute,
    private storageService: StorageService // Inject StorageService
  ) {
    this.applicationForm = this.fb.group({
      applicationText: ['', [Validators.required, Validators.minLength(100)]],
      links: this.fb.array([this.fb.control('', Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/))]),
      hasPreviousExperience: [false],
      previousExperiences: this.fb.array([])
    });
  }
  benefitItems = [
    {
      title: 'Share Your Knowledge',
      description: 'Pass on your expertise to the next generation of professionals and make a real difference in their careers.',
      icon: 'pi pi-book',
      bgGradient: 'linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%)'
    },
    {
      title: 'Expand Your Network',
      description: 'Connect with talented individuals and industry leaders, expanding your professional network in meaningful ways.',
      icon: 'pi pi-users',
      bgGradient: 'linear-gradient(135deg, #3182CE 0%, #63B3ED 100%)'
    },
    {
      title: 'Enhance Your Reputation',
      description: 'Build credibility as a thought leader in your field and gain recognition for your expertise and contributions.',
      icon: 'pi pi-star',
      bgGradient: 'linear-gradient(135deg, #2F855A 0%, #48BB78 100%)'
    },
    {
      title: 'Develop Leadership Skills',
      description: 'Refine your leadership and communication abilities by guiding others through challenges and growth opportunities.',
      icon: 'pi pi-chart-line',
      bgGradient: 'linear-gradient(135deg, #DD6B20 0%, #F6AD55 100%)'
    },
    {
      title: 'Give Back to the Community',
      description: 'Contribute to the growth of your professional community and help create opportunities for underrepresented groups.',
      icon: 'pi pi-heart',
      bgGradient: 'linear-gradient(135deg, #9F7AEA 0%, #B794F4 100%)'
    }
  ];

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
    this.addLink();
  }

  get previousExperiences(): FormArray {
    return this.applicationForm.get('previousExperiences') as FormArray;
  }

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

    // Get logged-in user ID
    const userId = this.storageService.getLoggedInUserId();
    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'User Not Logged In',
        detail: 'You must be logged in to submit a mentor application.'
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
      cv: this.isEditMode && this.existingCvFileName ? this.existingApplication?.cv || '' : '',
      uploadPaper: this.isEditMode && this.existingPaperFileName ? this.existingApplication?.uploadPaper || '' : ''
    };

    // Log the application object to verify the data
    console.log(`${this.isEditMode ? 'Update' : 'Create'} application data being sent:`, application);

    if (this.isEditMode) {
      this.updateApplication(application);
    } else {
      this.createApplication(userId, application);
    }
  }

  private createApplication(userId: number, application: MentorApplication): void {
    this.mentorAppService.createApplication(userId, application, this.cvFile!, this.uploadPaperFile || undefined)
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

    this.mentorAppService.updateApplication(
        this.applicationId!, 
        application, 
        this.cvFile || undefined, 
        this.uploadPaperFile || undefined
    )
    .pipe(
        catchError(err => {
            console.error('Error updating application:', err);
            this.handleSubmissionError(err);
            return EMPTY;
        }),
        switchMap(updatedApp => {
            console.log('Application updated successfully:', updatedApp);

            if (application.hasPreviousExperience) {
                console.log('Handling previous experiences');
                return this.previousExperienceService.deleteExperiencesByApplicationId(this.applicationId!)
                    .pipe(
                        tap(() => console.log('Deleted existing experiences')),
                        catchError(err => {
                            console.error('Error deleting experiences:', err);
                            this.handleSubmissionError(err);
                            return EMPTY;
                        }),
                        switchMap(() => {
                            if (this.previousExperiences.length > 0) {
                                this.savePreviousExperiences(this.applicationId!);
                            } else {
                                this.handleSuccessfulSubmission(this.applicationId!, 'updated');
                            }
                            return of(updatedApp);
                        })
                    );
            } else {
                return this.previousExperienceService.deleteExperiencesByApplicationId(this.applicationId!)
                    .pipe(
                        tap(() => this.handleSuccessfulSubmission(this.applicationId!, 'updated')),
                        catchError(err => {
                            console.error('Error deleting experiences:', err);
                            this.handleSubmissionError(err);
                            return EMPTY;
                        }),
                        map(() => updatedApp)
                    );
            }
        })
    )
    .subscribe();
}

  private savePreviousExperiences(applicationId: number): void {
    const experiences = this.previousExperiences.value as PreviousExperience[];
    console.log('Saving experiences:', experiences);

    if (experiences.length === 0) {
        console.log('No experiences to save');
        this.handleSuccessfulSubmission(applicationId, this.isEditMode ? 'updated' : 'created');
        return;
    }

    const requests = experiences.map(exp => {
        const formattedExp: PreviousExperience = {
            hackathonName: exp.hackathonName,
            year: exp.year,
            description: exp.description,
            numberOfTeamsCoached: exp.numberOfTeamsCoached
        };

        console.log('Creating experience:', formattedExp);
        return this.previousExperienceService.createExperience(applicationId, formattedExp);
    });

    forkJoin(requests)
        .pipe(
            catchError(err => {
                console.error('Error saving experiences:', err);
                this.handleSubmissionError(err);
                return of(null);
            })
        )
        .subscribe(results => {
            if (results) {
                console.log('All experiences saved successfully:', results);
                this.handleSuccessfulSubmission(applicationId, this.isEditMode ? 'updated' : 'created');
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

  hasExistingFile(type: 'cv' | 'paper'): boolean {
    return type === 'cv' 
      ? !!this.existingCvFileName 
      : !!this.existingPaperFileName;
  }

  onCancel(): void {
    if (this.isEditMode && this.applicationId) {
      this.router.navigate(['/mentor-applications', this.applicationId]);
    } else {
      this.router.navigate(['/mentor-applications']);
    }
  }
}