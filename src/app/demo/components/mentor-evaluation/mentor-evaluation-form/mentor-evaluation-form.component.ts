import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MentorEvaluationService } from 'src/app/demo/services/mentor-evaluation.service';

@Component({
  selector: 'app-mentor-evaluation-form',
  templateUrl: './mentor-evaluation-form.component.html',
  styleUrls: ['./mentor-evaluation-form.component.scss'],
  providers: [MessageService]
})
export class MentorEvaluationFormComponent implements OnInit {
  evaluation = {
    id: null as number | null,
    rating: 0,
    feedbackText: ''
  };

  submitted = false;
  isEditMode = false;

  constructor(
    private evaluationService: MentorEvaluationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    public router: Router  
  ) { }

  ngOnInit(): void {
    // Check if we're in edit mode by looking for an ID parameter
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.loadEvaluation(Number(params['id']));
      }
    });
  }

  loadEvaluation(id: number) {
    this.evaluationService.getEvaluationById(id).subscribe({
      next: (data) => {
        if (!data) {
          throw new Error('Evaluation not found');
        }
        this.evaluation = {
          id: data.id ?? null,
          rating: data.rating,
          feedbackText: data.feedbackText
        };
      },
      error: (err) => {
        console.error('Error loading evaluation:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Evaluation not found or failed to load'
        });
      }
    });
  }

  submitEvaluation() {
    this.submitted = true;
    
    console.log('Processing evaluation:', this.evaluation); // Debug log
    
    // Validate rating (allowing 0-5)
    if (this.evaluation.rating < 0 || this.evaluation.rating > 5) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Rating must be between 0 and 5'
      });
      return;
    }
  
    if (this.isEditMode && this.evaluation.id !== null) {
      // Update existing evaluation
      this.evaluationService.updateEvaluation(this.evaluation.id, this.evaluation).subscribe({
        next: (res) => {
          console.log('Update success response:', res); // Debug log
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Evaluation updated successfully'
          });
          // Navigate back to a list view or dashboard after successful update
          setTimeout(() => this.router.navigate(['/mydashboard']), 1500);
        },
        error: (err) => this.handleError(err)
      });
    } else {
      // Create new evaluation
      this.evaluationService.createEvaluation(this.evaluation).subscribe({
        next: (res) => {
          console.log('Create success response:', res); // Debug log
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Evaluation submitted successfully'
          });
          this.resetForm();
        },
        error: (err) => this.handleError(err)
      });
    }
  }
  
  handleError(err: any) {
    console.error('Error full object:', err); // Full error object
    console.error('Error response:', err.error); // Just the error payload
    
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
  
  resetForm() {
    this.evaluation = {
      id: null,
      rating: 0,
      feedbackText: ''
    };
    this.submitted = false;
  }

  cancelEdit() {
    this.router.navigate(['/mydashboard']);
  }
}