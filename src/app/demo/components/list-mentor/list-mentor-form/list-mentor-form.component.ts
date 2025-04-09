import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListMentor } from 'src/app/demo/models/list-mentor.model';
import { ListMentorService } from 'src/app/demo/services/list-mentor.service';
import { User } from 'src/app/demo/models/user.model';
import { Hackathon } from 'src/app/demo/models/hackathon.model';

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
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private listMentorService: ListMentorService
  ) {
    this.mentorForm = this.fb.group({
      numberOfTeams: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode by looking for an ID parameter
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.mentorId = +params['id'];
        this.loadMentorData();
      }
    });
  }

  loadMentorData(): void {
    this.listMentorService.getListMentorById(this.mentorId).subscribe({
      next: (data: ListMentor) => {
        this.mentorForm.patchValue({
          numberOfTeams: data.numberOfTeams
        });
      },
      error: (err) => {
        this.errorMessage = 'Failed to load mentor data. Please try again.';
        console.error('Error loading mentor data:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.mentorForm.invalid) {
      return;
    }
  
    this.isSubmitting = true;
    const numberOfTeams = this.mentorForm.get('numberOfTeams')?.value;
  
    if (this.isEditMode) {
      // Update existing mentor listing
      this.listMentorService.updateListMentor(this.mentorId, numberOfTeams).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/list-mentors']); // Navigate to edit route
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to update mentor listing. Please try again.';
          console.error('Error updating mentor listing:', err);
        }
      });
    } else {
      // Create new mentor listing
      this.listMentorService.createListMentor(numberOfTeams).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/landing']); // Navigate to landing page
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
    if (this.isEditMode) {
      this.router.navigate(['/list-mentors']); // Back to list for edit
    } else {
      this.router.navigate(['/landing']); // Back to landing for creation
    }
  }}