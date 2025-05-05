import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProjectEvaluationService } from '../../../service/project-evaluation.service';
import { ProjectEvaluation } from '../../../api/project-evaluation';
import { TeamSubmission } from '../../../api/team-submission';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-landing-project-evaluation',
  templateUrl: './landing-project-evaluation.component.html',
  styleUrls: ['./landing-project-evaluation.component.scss']
})
export class LandingProjectEvaluationComponent implements OnInit {
  evaluations: ProjectEvaluation[] = [];
  topRatedEvaluations: ProjectEvaluation[] = [];
  loading = false;
  error: string | null = null;
  selectedEvaluation: ProjectEvaluation | null = null;
  minScore = 90;
  donationAmount: number | null = null;
  donationEvaluationId: number | null = null;
  donationSuccess = false;
  
  // Form related properties
  evaluationForm: FormGroup;
  teamSubmissions: TeamSubmission[] = [];
  submissionId: number | null = null;
  submitting = false;
  showDonationModal = false;

  newEvaluation: ProjectEvaluation = {
    score: 0,
    feedback: '',
    evaluationDate: new Date(),
    // projectName: '',
    teamSubmission: { id: 0, projectName: '', description: '', repoLink: '' },
    evaluator: { id: 2 }
  };

  // Popup mode properties
  isPopup = false;
  submissionIdFromPopup: number | null = null;
  projectNameFromPopup: string | null = null;
  submissionFromPopup: TeamSubmission | null = null;

  constructor(
    private http: HttpClient,
    private projectEvaluationService: ProjectEvaluationService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.evaluationForm = this.fb.group({
      submissionId: [null, [Validators.required, Validators.min(1)]],
      evaluatorId: [2, [Validators.required, Validators.min(1)]],
      score: [50, [Validators.required, Validators.min(1), Validators.max(100)]],
      feedback: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if component is opened as a popup dialog
    if (this.config && this.config.data) {
      this.isPopup = this.config.data.isPopup || false;
      this.submissionIdFromPopup = this.config.data.submissionId || null;
      this.projectNameFromPopup = this.config.data.projectName || null;
      this.submissionFromPopup = this.config.data.submission || null;
      
      console.log('Popup data received:', { 
        isPopup: this.isPopup,
        submissionId: this.submissionIdFromPopup,
        projectName: this.projectNameFromPopup,
        submission: this.submissionFromPopup ? 'Present' : 'Not present'
      });
      
      // If we have the submission object directly from popup, use it
      if (this.submissionFromPopup) {
        console.log('Using submission from popup data:', this.submissionFromPopup);
        this.newEvaluation.teamSubmission = this.submissionFromPopup;
        this.submissionId = this.submissionFromPopup.id || null;
        this.evaluationForm.patchValue({
          submissionId: this.submissionFromPopup.id
        });
      }
      // If in popup mode with a specific submission ID but no submission object, load it
      else if (this.submissionIdFromPopup !== null && this.submissionIdFromPopup !== undefined) {
        this.submissionId = this.submissionIdFromPopup;
        this.loadSubmissionDetails();
      }
    } else {
      // Check for query params if not in popup mode
      this.route.queryParams.subscribe(params => {
        const submissionId = params['submissionId'];
        if (submissionId) {
          this.submissionId = +submissionId;
          this.projectEvaluationService.getSubmissionById(this.submissionId).subscribe({
            next: (submission: TeamSubmission) => {
              if (submission) {
                this.newEvaluation.teamSubmission = submission;
                this.evaluationForm.patchValue({
                  submissionId: submission.id
                });
                this.cdr.detectChanges();
              }
            },
            error: (err: any) => {
              console.error('Error fetching submission:', err);
            }
          });
        }
      });
      
      // Load evaluations and team submissions
      this.loadEvaluations();
      this.loadTopRatedEvaluations();
      this.loadTeamSubmissions();
    }
  }

  loadEvaluations(): void {
    this.loading = true;
    this.error = null;
    this.projectEvaluationService.getAllEvaluations().subscribe({
      next: (data: ProjectEvaluation[]) => {
        this.evaluations = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Erreur lors du chargement des évaluations : ' + (err.message || 'Erreur réseau');
        this.loading = false;
      }
    });
  }

  loadTopRatedEvaluations(): void {
    this.loading = true;
    this.error = null;
    this.projectEvaluationService.getTopRatedProjects(this.minScore).subscribe({
      next: (data: ProjectEvaluation[]) => {
        this.topRatedEvaluations = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Erreur lors du chargement des projets les mieux notés : ' + (err.message || 'Erreur réseau');
        this.loading = false;
      }
    });
  }

  loadTeamSubmissions(): void {
    this.projectEvaluationService.getAllSubmissions().subscribe({
      next: (submissions: TeamSubmission[]) => {
        this.teamSubmissions = submissions;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading team submissions:', err);
        this.error = 'Failed to load team submissions';
      }
    });
  }

  createEvaluation(): void {
    if (this.evaluationForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.evaluationForm.controls).forEach(key => {
        const control = this.evaluationForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    
    // Get form values
    const formValues = this.evaluationForm.value;
    
    // Get the direct values from the form
    const submissionId = formValues.submissionId;
    const evaluatorId = formValues.evaluatorId;
    const score = formValues.score || 0;
    const feedback = formValues.feedback || '';
    
    console.log('Form values:', {
      submissionId,
      evaluatorId,
      score,
      feedback
    });
    
    // Prepare evaluation object
    const evaluation: ProjectEvaluation = {
      score: score,
      feedback: feedback,
      evaluationDate: new Date(),
      teamSubmission: {
        id: submissionId,
        projectName: this.projectNameFromPopup || '',
        description: '',
        repoLink: ''
      },
      evaluator: { 
        id: evaluatorId,
        email: 'evaluator@example.com' // Add a valid email address for the evaluator
      }
    };
    
    console.log('Submitting evaluation:', evaluation);
    
    // Submit evaluation using the simplified service
    this.projectEvaluationService.createEvaluation(evaluation).subscribe({
      next: (response: string) => {
        console.log('Evaluation created successfully:', response);
        this.submitting = false;
        
        // Reset form
        this.resetForm();
        
        // Show success message
        this.error = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Evaluation submitted successfully!'
        });
        
        // If in popup mode, close dialog with success result
        if (this.isPopup && this.ref) {
          this.ref.close(true);
        } else {
          // Otherwise, reload evaluations
          this.loadEvaluations();
        }
      },
      error: (err: any) => {
        console.error('Error creating evaluation:', err);
        let errorMessage = 'Failed to submit evaluation';
        
        if (err.error && typeof err.error === 'string') {
          errorMessage += ': ' + err.error;
        } else if (err.message) {
          errorMessage += ': ' + err.message;
        } else if (err.status) {
          errorMessage += ` (Status: ${err.status})`;
        }
        
        this.error = errorMessage;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        
        this.submitting = false;
      }
    });
  }

  selectEvaluation(evaluation: ProjectEvaluation): void {
    this.selectedEvaluation = { ...evaluation };
  }

  updateEvaluation(): void {
    if (this.selectedEvaluation && this.selectedEvaluation.id) {
      // Create a clean payload without projectName
      const payload = {
        id: this.selectedEvaluation.id,
        score: this.selectedEvaluation.score,
        feedback: this.selectedEvaluation.feedback,
        evaluationDate: this.selectedEvaluation.evaluationDate,
        teamSubmission: this.selectedEvaluation.teamSubmission,
        evaluator: this.selectedEvaluation.evaluator
        // Only include fields that exist in your backend entity
      };

      this.projectEvaluationService.updateEvaluation(
          this.selectedEvaluation.id,
          payload
      ).subscribe({
        next: () => {
          alert('Évaluation mise à jour avec succès !');
          this.selectedEvaluation = null;
          this.loadEvaluations();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.error = 'Erreur lors de la mise à jour : ' + (err.message || 'Erreur réseau');
          console.error('Erreur :', err);
          this.cdr.detectChanges();
        }
      });
    }
  }
  resetForm(): void {
    this.evaluationForm.reset({
      score: 50
    });
  }

  viewEvaluationDetails(evaluation: ProjectEvaluation): void {
    this.selectedEvaluation = { ...evaluation };
  }

  prepareDonation(evaluation: ProjectEvaluation): void {
    this.donationEvaluationId = evaluation.id || null;
    this.donationAmount = 5; // Default donation amount
    this.showDonationModal = true;
  }

  processDonation(): void {
    if (!this.donationEvaluationId || !this.donationAmount) {
      this.error = 'Invalid donation details';
      return;
    }

    this.loading = true;
    // Mock payment intent creation for Stripe
    const paymentData = {
      amount: this.donationAmount * 100, // Convert to cents for Stripe
      evaluationId: this.donationEvaluationId,
      currency: 'usd'
    };

    // This would typically call your backend to create a payment intent
    setTimeout(() => {
      // Simulate successful donation
      this.donationSuccess = true;
      this.showDonationModal = false;
      this.loading = false;
      
      // Reset after showing success message
      setTimeout(() => {
        this.donationSuccess = false;
      }, 5000);
    }, 1500);
  }

  onGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    // Implement filtering logic here
  }

  delete(id: number): void {
    if (id == null || id === undefined) {
      this.error = 'L\'ID de l\'évaluation est invalide.';
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      this.projectEvaluationService.deleteEvaluation(id).subscribe({
        next: () => {
          this.loadEvaluations();
        },
        error: (err: any) => {
          this.error = 'Erreur lors de la suppression : ' + (err.message || 'Erreur réseau');
        }
      });
    }
  }

  showDonationForm(evaluationId: number): void {
    console.log('Affichage du formulaire de don pour evaluationId :', evaluationId);
    this.donationEvaluationId = evaluationId;
    this.donationAmount = null;
    this.cdr.detectChanges();
  }

  loadSubmissionDetails(): void {
    // Use the submissionId from popup if available, otherwise use the regular submissionId
    const submissionIdToUse = this.submissionIdFromPopup !== null ? this.submissionIdFromPopup : this.submissionId;
    
    if (!submissionIdToUse) {
      console.error('No submission ID provided');
      this.error = 'No submission ID provided';
      return;
    }
    
    console.log('Loading submission details for ID:', submissionIdToUse);
    
    this.projectEvaluationService.getSubmissionById(submissionIdToUse).subscribe({
      next: (submission: TeamSubmission) => {
        if (submission) {
          console.log('Submission details loaded:', submission);
          this.newEvaluation.teamSubmission = submission;
          this.evaluationForm.patchValue({
            submissionId: submission.id
          });
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        console.error('Error fetching submission details:', err);
        this.error = 'Failed to load submission details';
      }
    });
  }
}
