import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-evaluation-dialog',
  templateUrl: './evaluation-dialog.component.html',
  styleUrls: ['./evaluation-dialog.component.scss']
})
export class EvaluationDialogComponent implements OnInit {
  evaluationForm!: FormGroup;
  submitting = false;
  submissionId: string = '';
  teamMemberId: string = '';
  hackathonId: string = '';
  
  // Mock data for testing until backend is ready
  mockEvaluationId = 'eval_' + Math.random().toString(36).substring(2, 15);

  constructor(
    private fb: FormBuilder,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageService: MessageService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.submissionId = this.config.data.submissionId;
    this.teamMemberId = this.config.data.teamMemberId;
    this.hackathonId = this.config.data.hackathonId;
    
    this.evaluationForm = this.fb.group({
      score: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
      feedback: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  submitEvaluation(): void {
    if (this.evaluationForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields correctly'
      });
      return;
    }

    this.submitting = true;
    const evaluationData = {
      submissionId: this.submissionId,
      teamMemberId: this.teamMemberId,
      hackathonId: this.hackathonId,
      score: this.evaluationForm.value.score,
      feedback: this.evaluationForm.value.feedback,
      evaluationDate: new Date().toISOString()
    };

    // Use mock implementation for now
    this.mockSubmitEvaluation(evaluationData);
  }

  private mockSubmitEvaluation(evaluationData: any): void {
    // Simulate API delay
    setTimeout(() => {
      // Create a mock response
      const mockResponse = {
        id: this.mockEvaluationId,
        ...evaluationData,
        evaluator: {
          id: localStorage.getItem('userId') || 'unknown',
          name: localStorage.getItem('userName') || 'Anonymous User'
        },
        status: 'completed'
      };

      this.submitting = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Your evaluation has been submitted successfully!'
      });
      
      this.dialogRef.close(mockResponse);
    }, 800);
  }

  // When backend is ready, uncomment this method
  /*
  private submitEvaluationToApi(evaluationData: any): void {
    this.http.post(`${environment.apiUrl}/evaluations`, evaluationData)
      .subscribe({
        next: (response) => {
          this.submitting = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Your evaluation has been submitted successfully!'
          });
          this.dialogRef.close(response);
        },
        error: (error) => {
          this.submitting = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to submit evaluation. Please try again.'
          });
        }
      });
  }
  */

  cancel(): void {
    this.dialogRef.close();
  }

  // Helper method to get character count for feedback
  get feedbackLength(): number {
    return this.evaluationForm.get('feedback')?.value?.length || 0;
  }

  get feedbackMaxLength(): number {
    return 500;
  }
  
  // Helper method to determine score class based on value
  getScoreClass(score: number): string {
    if (score >= 75) {
      return 'high-score';
    } else if (score >= 50) {
      return 'medium-score';
    } else {
      return 'low-score';
    }
  }
}
