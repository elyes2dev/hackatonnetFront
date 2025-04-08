import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MentorApplication, ApplicationStatus } from 'src/app/demo/models/mentor-application.model';
import { MentorApplicationService } from 'src/app/demo/services/mentor-application.service';

@Component({
  selector: 'app-mentor-application-form',
  templateUrl: './mentor-application-form.component.html',
  styleUrls: ['./mentor-application-form.component.scss']
})
export class MentorApplicationFormComponent implements OnInit {
  applicationForm: FormGroup;
  cvFile: File | null = null;
  uploadPaperFile: File | null = null;
  submitting = false;
  errorMessage = '';
  
  // Static user ID for the existing user in the database
  private readonly userId = 1; // Replace with your actual static user ID
  
  constructor(
    private fb: FormBuilder,
    private mentorApplicationService: MentorApplicationService,
    private router: Router
  ) {
    this.applicationForm = this.fb.group({
      applicationText: ['', [Validators.required, Validators.minLength(100)]],
      links: this.fb.array([this.fb.control('')]),
      hasPreviousExperience: [false],
      previousExperiences: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.setupExperienceFields();
  }

  // Getters for form access in template
  get links(): FormArray {
    return this.applicationForm.get('links') as FormArray;
  }

  get previousExperiences(): FormArray {
    return this.applicationForm.get('previousExperiences') as FormArray;
  }

  // File handlers
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

  // Form array management
  addLink(): void {
    this.links.push(this.fb.control(''));
  }

  removeLink(index: number): void {
    if (this.links.length > 1) {
      this.links.removeAt(index);
    }
  }

  addExperience(): void {
    this.previousExperiences.push(
      this.fb.group({
        companyName: ['', Validators.required],
        position: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: [''],
        description: ['']
      })
    );
  }

  removeExperience(index: number): void {
    this.previousExperiences.removeAt(index);
  }

  setupExperienceFields(): void {
    const hasPreviousExperienceControl = this.applicationForm.get('hasPreviousExperience');
    
    hasPreviousExperienceControl?.valueChanges.subscribe(hasExperience => {
      if (hasExperience && this.previousExperiences.length === 0) {
        this.addExperience();
      } else if (!hasExperience) {
        while (this.previousExperiences.length) {
          this.previousExperiences.removeAt(0);
        }
      }
    });
  }

  // Form submission
  onSubmit(): void {
    if (this.applicationForm.invalid) {
      this.markFormGroupTouched(this.applicationForm);
      return;
    }

    this.submitting = true;
    
    const formValue = this.applicationForm.value;
    
    // Filter out empty links
    const nonEmptyLinks = formValue.links.filter((link: string) => link.trim() !== '');
    
    const application: MentorApplication = {
      user: {
        id: this.userId,
        name: '',
        lastname: '',
        email: '',
        username: '',
        password: '',
        birthdate: null,
        picture: '',
        description: ''
      }, // Using the static user ID
      applicationText: formValue.applicationText,
      cv: '', // Will be set by the backend
      uploadPaper: '', // Will be set by the backend
      links: nonEmptyLinks,
      hasPreviousExperience: formValue.hasPreviousExperience,
      status: ApplicationStatus.PENDING,
      previousExperiences: formValue.hasPreviousExperience ? formValue.previousExperiences : []
    };

    this.mentorApplicationService.createApplication(application, this.cvFile || undefined, this.uploadPaperFile || undefined)
      .subscribe({
        next: (response) => {
          this.submitting = false;
          this.router.navigate(['/applications/success']);
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = 'Failed to submit application. Please try again.';
          console.error('Application submission error:', error);
        }
      });
  }

  // Helper function to mark all controls as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormControl) {
        control.markAsTouched();
      } else if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        for (const item of (control as FormArray).controls) {
          if (item instanceof FormGroup) {
            this.markFormGroupTouched(item);
          }
        }
      }
    });
  }
}