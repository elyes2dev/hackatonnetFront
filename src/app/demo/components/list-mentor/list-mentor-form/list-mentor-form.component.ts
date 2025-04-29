import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ListMentorService } from 'src/app/demo/services/list-mentor.service';
import { GoogleCalendarService } from 'src/app/demo/services/googlecalendar.service';
import { StorageService } from 'src/app/demo/services/storage.service';

@Component({
  selector: 'app-list-mentor-form',
  templateUrl: './list-mentor-form.component.html',
  styleUrls: ['./list-mentor-form.component.scss']
})
export class ListMentorFormComponent implements OnInit {
  mentorForm: FormGroup;
  isEditMode = false;
  mentorId = 0;
  hackathonId: number;
  isSubmitting = false;
  isGoogleCalendarConnected = false;
  showGoogleCalendarButton = false;
  showAddToCalendarButton = false;
  createdMentorListingId: number | null = null;
  errorMessage = '';
  currentUser: any = null; // Store logged-in user details
  userEmail: string | null = null; // Store user email

  constructor(
    private fb: FormBuilder,
    private listMentorService: ListMentorService,
    private googleCalendarService: GoogleCalendarService,
    private storageService: StorageService,
    private messageService: MessageService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.mentorForm = this.fb.group({
      numberOfTeams: [1, [Validators.required, Validators.min(1)]]
    });
    this.hackathonId = this.config.data?.hackathonId || 0;
    this.isEditMode = !!this.config.data?.mentorListingId;
    this.mentorId = this.config.data?.mentorListingId || 0;
  }

  ngOnInit(): void {
    this.loadCurrentUser(); // Load user details on init
    if (this.isEditMode && this.mentorId) {
      this.loadMentorData();
    }
  }

  loadCurrentUser(): void {
    const userId = this.storageService.getLoggedInUserId();
    console.log('Loading user, userId:', userId, 'JWT Token:', localStorage.getItem('jwtToken')); // Debug log

    if (userId) {
      this.storageService.getUserById(userId).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.userEmail = user.email || null;
          localStorage.setItem('userEmail', this.userEmail || ''); // Store email for other components
          console.log('Loaded user:', user, 'Email:', this.userEmail);
          this.checkGoogleCalendarStatus(); // Check calendar status after loading user
        },
        error: (err) => {
          console.error('Error loading user:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load user information. Please log in again.'
          });
          localStorage.removeItem('userId');
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('userEmail');
          this.ref.close(false); // Close dialog if user cannot be loaded
        }
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User not logged in'
      });
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userEmail');
      this.ref.close(false);
    }
  }

  checkGoogleCalendarStatus(): void {
    if (!this.userEmail) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User email not available. Please log in.'
      });
      this.showGoogleCalendarButton = true;
      this.showAddToCalendarButton = false;
      return;
    }

    console.log('Checking calendar status, JWT Token:', localStorage.getItem('jwtToken'));
    this.googleCalendarService.isGoogleCalendarConnected().subscribe({
      next: (response) => {
        this.isGoogleCalendarConnected = response.connected;
        this.showGoogleCalendarButton = !response.connected;
        this.showAddToCalendarButton = response.connected && (this.isEditMode || this.createdMentorListingId !== null);
      },
      error: (error) => {
        console.error('Error checking calendar status:', error);
        if (error.status === 401) {
          this.messageService.add({
            severity: 'error',
            summary: 'Unauthorized',
            detail: 'Please log in to access Google Calendar features'
          });
          localStorage.removeItem('userId');
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('userEmail');
          this.ref.close(false);
        } else if (error.status === 404) {
          this.messageService.add({
            severity: 'error',
            summary: 'User Not Found',
            detail: 'User account not found. Please log in again.'
          });
          localStorage.removeItem('userId');
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('userEmail');
          this.ref.close(false);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to check Google Calendar status'
          });
        }
        this.showGoogleCalendarButton = true;
        this.showAddToCalendarButton = false;
      }
    });
  }

  connectGoogleCalendar(): void {
    if (!this.userEmail) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User email not available. Please log in.'
      });
      return;
    }

    console.log('Connecting Google Calendar, JWT Token:', localStorage.getItem('jwtToken'));
    this.googleCalendarService.getGoogleAuthUrl().subscribe({
      next: (response) => {
        const authWindow = window.open(response.url, 'googleAuthPopup', 'width=800,height=600');
        if (!authWindow) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Unable to open authentication window.'
          });
          return;
        }

        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          if (event.data === 'google_auth_success') {
            authWindow.close();
            this.checkGoogleCalendarStatus();
          } else if (event.data === 'google_auth_error') {
            authWindow.close();
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to connect Google Calendar.'
            });
          }
        };

        window.addEventListener('message', handleMessage);
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            this.checkGoogleCalendarStatus();
          }
        }, 500);
      },
      error: (error) => {
        console.error('Error fetching auth URL:', error);
        if (error.status === 401) {
          this.messageService.add({
            severity: 'error',
            summary: 'Unauthorized',
            detail: 'Please log in to connect Google Calendar'
          });
          localStorage.removeItem('userId');
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('userEmail');
          this.ref.close(false);
        } else if (error.status === 404) {
          this.messageService.add({
            severity: 'error',
            summary: 'User Not Found',
            detail: 'User account not found. Please log in again.'
          });
          localStorage.removeItem('userId');
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('userEmail');
          this.ref.close(false);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to connect to Google Calendar'
          });
        }
      }
    });
  }

  addToCalendar(): void {
    const numberOfTeams = this.mentorForm.get('numberOfTeams')?.value;
    if (!numberOfTeams || !this.hackathonId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Missing required fields'
      });
      return;
    }

    this.googleCalendarService.addEventToCalendar(this.hackathonId, numberOfTeams).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Hackathon event added to Google Calendar'
        });
        this.ref.close(true);
      },
      error: (err) => {
        if (err.status === 400 && err.error?.authUrl) {
          this.isGoogleCalendarConnected = false;
          this.showGoogleCalendarButton = true;
          this.showAddToCalendarButton = false;
          this.messageService.add({
            severity: 'warn',
            summary: 'Google Calendar Not Connected',
            detail: 'Please connect your Google Calendar first'
          });
        } else if (err.status === 401) {
          this.messageService.add({
            severity: 'error',
            summary: 'Unauthorized',
            detail: 'Please log in to add events to Google Calendar'
          });
          localStorage.removeItem('userId');
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('userEmail');
          this.ref.close(false);
        } else if (err.status === 404) {
          this.messageService.add({
            severity: 'error',
            summary: 'User Not Found',
            detail: 'User account not found. Please log in again.'
          });
          localStorage.removeItem('userId');
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('userEmail');
          this.ref.close(false);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to add event to calendar'
          });
        }
      }
    });
  }

  loadMentorData(): void {
    this.listMentorService.getListMentorById(this.mentorId).subscribe({
      next: (data) => {
        this.mentorForm.patchValue({ numberOfTeams: data.numberOfTeams });
        this.hackathonId = data.hackathon?.id || this.hackathonId;
        this.createdMentorListingId = data.id ?? null;
        this.checkGoogleCalendarStatus();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load mentor data'
        });
        this.isEditMode = false;
        this.mentorId = 0;
      }
    });
  }

  onSubmit(): void {
    if (this.mentorForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields'
      });
      return;
    }

    this.isSubmitting = true;
    const numberOfTeams = this.mentorForm.get('numberOfTeams')?.value;
    const userId = this.storageService.getLoggedInUserId();

    if (!userId || !this.hackathonId || !this.userEmail) {
      this.isSubmitting = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User, email, or hackathon details missing. Please log in.'
      });
      localStorage.removeItem('userId');
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userEmail');
      this.ref.close(false);
      return;
    }

    const action = this.isEditMode
      ? this.listMentorService.updateListMentor(this.mentorId, numberOfTeams)
      : this.listMentorService.createListMentor(userId, this.hackathonId, numberOfTeams);

    action.subscribe({
      next: (data) => {
        this.isSubmitting = false;
        this.createdMentorListingId = data.id ?? null;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode ? 'Mentor listing updated' : 'Mentor listing created'
        });
        this.checkGoogleCalendarStatus();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save mentor listing'
        });
      }
    });
  }

  cancel(): void {
    this.ref.close(false);
  }
}