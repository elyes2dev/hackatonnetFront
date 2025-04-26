import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { LayoutService } from '../../../../layout/service/app.layout.service';
import { MessageService } from 'primeng/api';
import { FileUploadService } from '../../../services/file-upload.service';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Role } from '../../../models/role';
import { jwtDecode } from 'jwt-decode';
import { StorageService } from 'src/app/demo/services/storage.service';
import { User } from 'src/app/demo/models/user.model';

interface RegistrationData {
  name: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  birthdate: Date | null;
  picture: string;
  description: string;
  badge: string;
  roles: Role[];
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [MessageService]
})
export class RegisterComponent {
  registrationData: RegistrationData = {
    name: '',
    lastname: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    birthdate: null,
    picture: '',
    description: '',
    badge: 'JUNIOR_COACH',
    roles: [{ name: 'student' }] // Initialize with the Role object structure
  };

  errorMessage: string | null = null;
  selectedProfilePicture: File | null = null;
  profilePicturePreview: string | null = null;
  isSubmitting = false;
  uploadProgress = 0;
  token: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    public layoutService: LayoutService,
    private messageService: MessageService,
    private fileUploadService: FileUploadService,
    private storageService: StorageService
  ) {}

  onProfilePictureSelected(event: any): void {
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
          detail: 'Profile picture file size should not exceed 2MB'
        });
        return;
      }
      
      this.selectedProfilePicture = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePicturePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return validTypes.includes(file.type);
  }

  removeProfilePicture(): void {
    this.selectedProfilePicture = null;
    this.profilePicturePreview = null;
  }

  registerUser() {
    const { name, lastname, email, username, password, confirmPassword } = this.registrationData;

    if (!name || !lastname || !email || !username || !password || !confirmPassword) {
      this.errorMessage = 'Please provide all the required fields.';
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isSubmitting = true;

    // If there's a selected profile picture, upload it first
    if (this.selectedProfilePicture) {
      this.uploadProfilePicture();
    } else {
      // Proceed with registration without an image
      this.completeRegistration();
    }
  }

  private uploadProfilePicture(): void {
    if (!this.selectedProfilePicture) {
      this.completeRegistration();
      return;
    }

    this.fileUploadService.uploadFile(this.selectedProfilePicture, 'logo')
      .pipe(
        finalize(() => {
          // Reset progress when complete regardless of outcome
          this.uploadProgress = 0;
        })
      )
      .subscribe({
        next: (event: HttpEvent<any>) => {
          // Track upload progress
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          }
          
          // Handle the response
          if (event instanceof HttpResponse) {
            if (event.body && event.body.filePath) {
              // Use the getFileUrl method to generate the complete URL
              this.registrationData.picture = this.fileUploadService.getFileUrl(event.body.filePath);
              this.completeRegistration();
            } else {
              this.handleUploadError('Invalid response from server');
            }
          }
        },
        error: (error) => {
          this.handleUploadError('Failed to upload profile picture');
          console.error('Error uploading file:', error);
        }
      });
  }

  private handleUploadError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: message
    });
    this.isSubmitting = false;
  }

  private completeRegistration(): void {
    const registrationPayload: User = {
      id: 0, // or undefined if your backend assigns it, but must be a number
      name: this.registrationData.name,
      lastname: this.registrationData.lastname,
      email: this.registrationData.email,
      username: this.registrationData.username,
      password: this.registrationData.password,
      birthdate: this.registrationData.birthdate,
      picture: this.registrationData.picture,
      description: this.registrationData.description,
      badge: this.registrationData.badge,
      roles: this.registrationData.roles.map(role => ({
        id: role.id ?? 0, // Assign a default id if undefined
        name: role.name
      })),
      score: 0,
      createdAt: new Date(),
      workshops: [],
      skills: [],
      mentorPoints: 0,
      monitorPoints: 0,
      hackathons: []
    };
  
    this.authService.register(registrationPayload).subscribe({
      next: () => {
        // Registration success — now LOGIN manually
        this.authService.login(this.registrationData.name, this.registrationData.password).subscribe({
          next: (response: any) => {
            if (response.jwtToken) {
                      this.token = response.jwtToken;
                      this.authService.storeToken(this.token);
            
                      const decodedToken: any = jwtDecode(this.token);
                      const userId = decodedToken.userid;
                      const roles: string[] = decodedToken.roles || [];
                      this.storageService.setUserId(userId);
            this.messageService.add({
              severity: 'success',
              summary: 'Registration Successful',
              detail: 'Your account has been created and you are now logged in!'
            });
            setTimeout(() => {
              this.router.navigate(['/landing']);
            }, 2500);
          }},
          error: (loginError: any) => {
            console.error('Login after registration failed:', loginError);
            this.errorMessage = 'Registration succeeded but login failed. Please login manually.';
            this.isSubmitting = false;
          }
        });
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = error?.error?.message || 'Registration failed. Please try again.';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
  onCancel(): void {
    this.router.navigate(['/auth/login']);
  }  
}