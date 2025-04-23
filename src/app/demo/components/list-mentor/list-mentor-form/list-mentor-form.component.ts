import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListMentor } from 'src/app/demo/models/list-mentor.model';
import { ListMentorService } from 'src/app/demo/services/list-mentor.service';
import { User } from 'src/app/demo/models/user.model';
import { Hackathon } from 'src/app/demo/models/hackathon.model';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { StorageService } from 'src/app/demo/services/storage.service';
import { GoogleCalendarService } from 'src/app/demo/services/googlecalendar.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-list-mentor-form',
  templateUrl: './list-mentor-form.component.html',
  styleUrls: ['./list-mentor-form.component.scss']
})
export class ListMentorFormComponent implements OnInit {
  mentorForm: FormGroup;
  isEditMode = false;
  mentorId: number = 0;
  isSubmitting = false;
  errorMessage: string = '';
  hackathonId: number;
  isGoogleCalendarConnected = false;
  showGoogleCalendarButton = false;
  showAddToCalendarButton = false;
  createdMentorListingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private listMentorService: ListMentorService,
    private storageService: StorageService,
    private googleCalendarService: GoogleCalendarService,
    private messageService: MessageService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.mentorForm = this.fb.group({
      numberOfTeams: [1, [Validators.required, Validators.min(1)]]
    });

    this.hackathonId = this.config.data?.hackathonId || 0;

    if (this.config.data?.mentorListingId) {
      this.isEditMode = true;
      this.mentorId = this.config.data.mentorListingId;
    } else {
      this.isEditMode = false;
      this.mentorId = 0;
    }
  }

  ngOnInit(): void {
    if (!this.config.data) {
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.mentorId = +params['id'];
          this.loadMentorData();
        }
      });
    }
    if (this.isEditMode && this.mentorId) {
      this.loadMentorData();
    }

    this.checkGoogleCalendarStatus();
  }

  checkGoogleCalendarStatus(): void {
    this.googleCalendarService.isGoogleCalendarConnected().subscribe({
      next: (response) => {
        this.isGoogleCalendarConnected = response.connected;
        this.showGoogleCalendarButton = !response.connected;
        this.showAddToCalendarButton = response.connected && !!this.createdMentorListingId;
      },
      error: (err) => {
        console.error('Error checking Google Calendar status:', err);
        this.showGoogleCalendarButton = true;
        this.showAddToCalendarButton = false;
      }
    });
  }

  connectGoogleCalendar(): void {
    this.googleCalendarService.getGoogleAuthUrl().subscribe({
      next: (response) => {
        const authWindow = window.open(
          response.url,
          'googleAuthPopup',
          'width=800,height=600'
        );

        if (!authWindow) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Unable to open authentication window. Please check your pop-up blocker settings.'
          });
        }
      },
      error: (err) => {
        console.error('Error getting Google auth URL:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to connect to Google Calendar'
        });
      }
    });
  }

  addToCalendar(): void {
    const numberOfTeams = this.mentorForm.get('numberOfTeams')?.value;

    if (typeof numberOfTeams !== 'number') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Number of teams is required'
      });
      return;
    }

    this.googleCalendarService.addEventToCalendar(this.hackathonId, numberOfTeams).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Hackathon event added to your Google Calendar'
        });
      },
      error: (err) => {
        console.error('Error adding event to calendar:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to add event to your calendar'
        });
      }
    });
  }

  loadMentorData(): void {
    if (!this.mentorId) {
      console.warn('Cannot load mentor data: No mentor ID provided');
      this.isEditMode = false;
      return;
    }

    this.listMentorService.getListMentorById(this.mentorId).subscribe({
      next: (data: ListMentor) => {
        this.mentorForm.patchValue({
          numberOfTeams: data.numberOfTeams
        });
        // Ensure data.id is a number or null
        this.createdMentorListingId = data.id ?? null; // Use nullish coalescing to handle undefined
        this.checkGoogleCalendarStatus();
      },
      error: (err) => {
        console.error('Error loading mentor data:', err);
        this.errorMessage = 'Failed to load mentor data. Please try again.';
        if (err.status === 404) {
          this.isEditMode = false;
          this.mentorId = 0;
        }
      }
    });
  }

  onSubmit(): void {
    if (this.mentorForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const numberOfTeams = this.mentorForm.get('numberOfTeams')?.value;
    const userId = this.storageService.getLoggedInUserId();

    if (typeof numberOfTeams !== 'number') {
      this.isSubmitting = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Number of teams is required'
      });
      return;
    }

    if (!userId) {
      this.isSubmitting = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User is not logged in'
      });
      return;
    }

    if (this.isEditMode) {
      this.listMentorService.updateListMentor(this.mentorId, numberOfTeams).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.ref.close(true);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to update mentor listing. Please try again.';
          console.error('Error updating mentor listing:', err);
        }
      });
    } else {
      this.listMentorService.createListMentor(userId, this.hackathonId, numberOfTeams).subscribe({
        next: (data: ListMentor) => {
          this.isSubmitting = false;
          // Ensure data.id is a number or null
          this.createdMentorListingId = data.id ?? null; // Use nullish coalescing to handle undefined
          this.checkGoogleCalendarStatus();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Mentor listing created successfully'
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to create mentor listing. Please try again.';
          console.error('Error creating mentor listing:', err);
        }
      });
    }
  }

  cancel(): void {
    this.ref.close(false);
  }
}