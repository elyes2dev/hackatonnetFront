import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListMentor } from 'src/app/demo/models/list-mentor.model';
import { ListMentorService } from 'src/app/demo/services/list-mentor.service';
import { User } from 'src/app/demo/models/user.model';
import { Hackathon } from 'src/app/demo/models/hackathon.model';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { StorageService } from 'src/app/demo/services/storage.service';

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
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private listMentorService: ListMentorService,
    private storageService: StorageService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.mentorForm = this.fb.group({
      numberOfTeams: [1, [Validators.required, Validators.min(1)]]
    });

  // Get hackathon ID from dialog config
  this.hackathonId = this.config.data?.hackathonId;
  
  // Check if we have a valid mentor listing ID for THIS hackathon
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
  }

  loadMentorData(): void {
    if (!this.mentorId) {
      console.warn('Cannot load mentor data: No mentor ID provided');
      this.isEditMode = false; // Force to create mode if no valid ID
      return;
    }
  
    this.listMentorService.getListMentorById(this.mentorId).subscribe({
      next: (data: ListMentor) => {
        this.mentorForm.patchValue({
          numberOfTeams: data.numberOfTeams
        });
      },
      error: (err) => {
        console.error('Error loading mentor data:', err);
        this.errorMessage = 'Failed to load mentor data. Please try again.';
        // Reset to create mode if the mentor listing can't be found
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
    const userId = this.storageService.getLoggedInUserId()!; // The '!' tells TypeScript to treat this as non-null

    if (this.isEditMode) {
      // Update existing mentor listing
      this.listMentorService.updateListMentor(this.mentorId, numberOfTeams).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.ref.close(true); // Close with success status
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to update mentor listing. Please try again.';
          console.error('Error updating mentor listing:', err);
        }
      });
    } else {
      // Create new mentor listing
      this.listMentorService.createListMentor(userId, this.hackathonId, numberOfTeams).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.ref.close(true); // Close with success status
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
    this.ref.close(false); // Close without saving
  
  }}