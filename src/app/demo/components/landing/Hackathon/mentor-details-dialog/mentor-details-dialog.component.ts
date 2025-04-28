import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { MentorEvaluationService } from 'src/app/demo/services/mentor-evaluation.service';
import { User } from 'src/app/demo/models/user.model';
import { MentorEvaluation } from 'src/app/demo/models/mentor-evaluation.model';
import { TeamMember } from 'src/app/demo/models/team-members';
import { StorageService } from 'src/app/demo/services/storage.service';
import { TeamMembersService } from 'src/app/demo/services/team-members.service';



@Component({
  selector: 'app-mentor-details-dialog',
  templateUrl: './mentor-details-dialog.component.html',
  styleUrls: ['./mentor-details-dialog.component.scss']
})
export class MentorDetailsDialogComponent implements OnInit {
  mentor!: User;
  loggedInUserId: number;
  userTeamId: number | null = null;
  
  evaluation = {
    id: null as number | null,
    rating: 0,
    feedbackText: ''
  };
  
  submitted = false;
  isEditMode = false;
  showEvaluationForm = false;
  loading = false;

  constructor(
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private evaluationService: MentorEvaluationService,
    private messageService: MessageService,
    private storageService: StorageService,
    private teamMemberService: TeamMembersService
  ) { 
    const userId = this.storageService.getLoggedInUserId();
    if (userId === null) {
      // handle the error properly (like redirect to login or show a message)
      throw new Error('User not logged in.');
    }
    this.loggedInUserId = userId;  }

  ngOnInit(): void {
    // Get mentor data passed from dialog config
    if (this.config.data && this.config.data.mentor) {
      this.mentor = this.config.data.mentor;
      
      this.getUserTeamId();

      // Check for existing evaluation
      if (this.mentor && this.mentor.id) {
        this.checkExistingEvaluation();
      }
    }
  }

  getBadgeIcon(): string {
    const badgeIcons: { [key: string]: string } = {
      JUNIOR_COACH: 'assets/demo/images/avatar/JUNIOR_COACH.png',
      ASSISTANT_COACH: 'assets/demo/images/avatar/ASSISTANT_COACH.png',
      SENIOR_COACH: 'assets/demo/images/avatar/SENIOR_COACH.png',
      HEAD_COACH: 'assets/demo/images/avatar/HEAD_COACH.png',
      MASTER_MENTOR: 'assets/demo/images/avatar/MASTER_MENTOR.png'
    };
    return this.mentor ? badgeIcons[this.mentor.badge] || 'assets/icons/default_badge.png' : '';
  }
  
  getUserTeamId() {
    this.loading = true;
    // Get team details for the logged-in user
    this.teamMemberService.getTeamMembersByUserId(this.loggedInUserId).subscribe({
      next: (teamMembers: any[]) => {
        if (teamMembers && teamMembers.length > 0) {
          // Server is returning {id, teamId, teamName, userId} format
          this.userTeamId = teamMembers[0].teamId;
          console.log('Found user team ID:', this.userTeamId);
        } else {
          console.log('User does not belong to any team');
          this.userTeamId = null;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error getting user team:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to get team information'
        });
        this.loading = false;
      }
    });
  }
  
  checkExistingEvaluation() {
    if (!this.mentor || !this.mentor.id) return;
    
    this.loading = true;
    this.evaluationService.getEvaluationsByMentorId(this.mentor.id).subscribe({
      next: (data: MentorEvaluation[]) => {
        if (data && data.length > 0) {
          // Find an evaluation made by the user's team if it exists
          const teamEvaluation = this.userTeamId 
            ? data.find(evaluation => evaluation.team?.id === this.userTeamId) 
            : null;
          
          // Use team's evaluation if found, otherwise use the first one
          const evaluationToUse = teamEvaluation || data[0];
          
          this.evaluation = {
            id: evaluationToUse.id ?? null,
            rating: evaluationToUse.rating,
            feedbackText: evaluationToUse.feedbackText
          };
          this.isEditMode = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error checking existing evaluation:', err);
        this.loading = false;
        // Silently fail - this just means there's no existing evaluation
      }
    });
  }

  toggleEvaluationForm() {
    this.showEvaluationForm = !this.showEvaluationForm;
  }

  submitEvaluation() {
    this.submitted = true;
    
    // Validate rating
    if (this.evaluation.rating < 0 || this.evaluation.rating > 5) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Rating must be between 0 and 5'
      });
      return;
    }
    
    // Validate feedback text
    if (!this.evaluation.feedbackText || this.evaluation.feedbackText.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Feedback is required'
      });
      return;
    }
    
    // Validate team ID
    if (!this.userTeamId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Team information not available'
      });
      return;
    }

    // Create the payload for the API
    const payload = {
      ...this.evaluation,
      mentor: { id: this.mentor.id },
      team: { id: this.userTeamId }
    };

    this.loading = true;
    
    if (this.isEditMode && this.evaluation.id !== null) {
      // Update existing evaluation
      this.evaluationService.updateEvaluation(this.evaluation.id, payload).subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Evaluation updated successfully'
          });
          this.loading = false;
          this.ref.close(res);
        },
        error: (err) => {
          this.loading = false;
          this.handleError(err);
        }
      });
    } else {
      // Create new evaluation
      this.evaluationService.createEvaluation(payload).subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Evaluation submitted successfully'
          });
          this.loading = false;
          this.ref.close(res);
        },
        error: (err) => {
          this.loading = false;
          this.handleError(err);
        }
      });
    }
  }
  
  handleError(err: any) {
    console.error('Error submitting evaluation:', err);
    
    let errorMessage = 'Unknown error';
    if (err.error && typeof err.error === 'string') {
      errorMessage = err.error;
    } else if (err.error && err.error.message) {
      errorMessage = err.error.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to ${this.isEditMode ? 'update' : 'submit'} evaluation: ` + errorMessage
    });
  }
  
  close() {
    this.ref.close();
  }
}