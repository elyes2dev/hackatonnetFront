import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, Observable, of } from 'rxjs';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { SponsorApplicationService } from 'src/app/demo/services/sponsor-application.service';
import { FileUploadService } from 'src/app/demo/services/file-upload.service';
import { SponsorApplication } from 'src/app/demo/models/sponsor-application';
import { MessageService } from 'primeng/api'; // Import PrimeNG MessageService
import { StorageService } from 'src/app/demo/services/storage.service';

interface UploadResult {
  filePath: string | null;
}

@Component({
  selector: 'app-sponsor-application-form',
  templateUrl: './sponsor-application-form.component.html',
  styleUrls: ['./sponsor-application-form.component.scss']
})
export class SponsorApplicationFormComponent implements OnInit {
  applicationForm!: FormGroup;
  isSubmitting = false;
  selectedLogo: File | null = null;
  selectedDocument: File | null = null;
  logoPreview: string | null = null;
  isDocumentRequired = true;
  
  // For file upload progress
  logoUploadProgress = 0;
  documentUploadProgress = 0;
  
  // Benefits carousel items
  benefitItems = [
    {
      title: 'Increase Brand Visibility',
      description: 'Showcase your brand to thousands of active users daily and boost recognition within our community.',
      icon: 'pi pi-eye',
      bgGradient: 'linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%)'
    },
    {
      title: 'Climb the Leaderboard',
      description: 'The more you sponsor, the higher you climb on our sponsors leaderboard, gaining additional exposure and recognition.',
      icon: 'pi pi-chart-line',
      bgGradient: 'linear-gradient(135deg, #3182CE 0%, #63B3ED 100%)'
    },
    {
      title: 'Exclusive Partner Events',
      description: 'Get invited to exclusive networking events and gain direct access to our community of industry professionals.',
      icon: 'pi pi-users',
      bgGradient: 'linear-gradient(135deg, #2F855A 0%, #48BB78 100%)'
    },
    {
      title: 'Custom Integration Options',
      description: 'Unlock custom integration options and showcase your products or services directly within our platform.',
      icon: 'pi pi-cog',
      bgGradient: 'linear-gradient(135deg, #DD6B20 0%, #F6AD55 100%)'
    },
    {
      title: 'Premium Support',
      description: 'Get priority support and dedicated account management to maximize your sponsorship benefits.',
      icon: 'pi pi-star',
      bgGradient: 'linear-gradient(135deg, #9F7AEA 0%, #B794F4 100%)'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private sponsorService: SponsorApplicationService,
    private fileUploadService: FileUploadService,
    private router: Router,
    private messageService: MessageService, // Add PrimeNG MessageService
    private storageService: StorageService // ✅ Injected here
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.applicationForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      registrationNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      websiteUrl: ['', [Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]]
    });
  }

  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!this.isValidImageType(file)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid File',
          detail: 'Please select a valid image file (JPEG, PNG, GIF)'
        });
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'File Too Large',
          detail: 'Logo file size should not exceed 2MB'
        });
        return;
      }
      
      this.selectedLogo = file;
      
      // Create preview for the logo
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onDocumentSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!this.isValidDocumentType(file)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid File',
          detail: 'Please select a valid document file (PDF, DOC, DOCX)'
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'File Too Large',
          detail: 'Document file size should not exceed 10MB'
        });
        return;
      }
      
      this.selectedDocument = file;
    }
  }

  isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return validTypes.includes(file.type);
  }

  isValidDocumentType(file: File): boolean {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return validTypes.includes(file.type);
  }

  uploadFile(file: File | null, type: 'logo' | 'document'): Observable<UploadResult> {
    if (!file) {
      return of({ filePath: null });
    }

    return new Observable<UploadResult>(observer => {
      this.fileUploadService.uploadFile(file, type).subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            // Update progress
            const progress = Math.round(100 * event.loaded / event.total);
            if (type === 'logo') {
              this.logoUploadProgress = progress;
            } else {
              this.documentUploadProgress = progress;
            }
          } else if (event instanceof HttpResponse) {
            // Complete with file path
            observer.next({ filePath: event.body?.filePath || null });
            observer.complete();
          }
        },
        error: (error: any) => {
          console.error(`Error uploading ${type}`, error);
          observer.error(error);
        }
      });
    });
  }

  onSubmit(): void {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }
  
    if (!this.selectedDocument && this.isDocumentRequired) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Document',
        detail: 'Please select a business document to upload'
      });
      return;
    }
  
    // ✅ Get logged-in user ID dynamically
    const userId = this.storageService.getLoggedInUserId();
    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'User Not Logged In',
        detail: 'You must be logged in to submit a sponsor application.'
      });
      return;
    }
  
    this.isSubmitting = true;
  
    // Upload logo
    this.uploadFile(this.selectedLogo, 'logo').pipe(
      finalize(() => {
        this.logoUploadProgress = 100;
      })
    ).subscribe({
      next: (logoResult: UploadResult) => {
        // Upload document
        this.uploadFile(this.selectedDocument, 'document').pipe(
          finalize(() => {
            this.documentUploadProgress = 100;
          })
        ).subscribe({
          next: (docResult: UploadResult) => {
            // Create application object
            const application: SponsorApplication = {
              ...this.applicationForm.value,
              companyLogo: logoResult.filePath,
              documentPath: docResult.filePath
            };
  
            // ✅ Submit with dynamic user ID
            this.sponsorService.submitApplication(userId, application).subscribe({
              next: (response) => {
                console.log('Application submitted successfully', response);
                this.isSubmitting = false;
  
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'Application submitted successfully! We will review it soon.'
                });
  
                setTimeout(() => {
                  this.router.navigate(['/sponsor-application-form']);
                }, 2000);
              },
              error: (error: any) => {
                console.error('Error submitting application', error);
                this.isSubmitting = false;
  
                this.messageService.add({
                  severity: 'error',
                  summary: 'Application Error',
                  detail: error.error?.message || 'Failed to submit application. Please try again later.'
                });
              }
            });
          },
          error: (error: any) => {
            console.error('Error uploading document', error);
            this.isSubmitting = false;
  
            this.messageService.add({
              severity: 'error',
              summary: 'Upload Error',
              detail: 'Failed to upload document. Please try again.'
            });
          }
        });
      },
      error: (error: any) => {
        console.error('Error uploading logo', error);
        this.isSubmitting = false;
  
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Error',
          detail: 'Failed to upload company logo. Please try again.'
        });
      }
    });
  }  
}