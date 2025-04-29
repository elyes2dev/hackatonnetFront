import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProjectEvaluationService } from '../../../service/project-evaluation.service';
import { ProjectEvaluation } from '../../../api/project-evaluation';
import { TeamSubmission } from '../../../api/team-submission';
import { loadStripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-landing-project-evaluation',
  templateUrl: './landing-project-evaluation.component.html',
  styleUrls: ['./landing-project-evaluation.component.scss']
})
export class LandingProjectEvaluationComponent implements OnInit {
  stripePromise = loadStripe('pk_test_51R9uQOCRTCCMntpfqwwnlonVcpy4gMnwyZamhJOGx8nhBfWWCQLlAw0ejgAVgrsEn4DnRNuyahhniFbXRYGy6TTq00Y20fwrAI', {
    stripeAccount: undefined,
    apiVersion: '2022-11-15' // Specify a fixed API version
  });
  evaluations: ProjectEvaluation[] = [];
  topRatedEvaluations: ProjectEvaluation[] = [];
  loading = false;
  error: string | null = null;
  selectedEvaluation: ProjectEvaluation | null = null;
  minScore = 90;
  clientSecret: string | null = null;
  cardElement: any;
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
  //  projectName: '',
    teamSubmission: { id: 0, projectName: '', description: '', repoLink: '' },
    evaluator: { id: 0 }
  };

  // Popup mode properties
  isPopup = false;
  submissionIdFromPopup: number | null = null;
  projectNameFromPopup: string | null = null;

  constructor(
    private http: HttpClient,
    private projectEvaluationService: ProjectEvaluationService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private fb: FormBuilder
  ) {
    this.evaluationForm = this.fb.group({
      teamSubmissionId: [null, Validators.required],
      innovationScore: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      technicalScore: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      designScore: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      feedback: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if component is opened as a popup dialog
    if (this.config && this.config.data) {
      this.isPopup = this.config.data.isPopup || false;
      this.submissionIdFromPopup = this.config.data.submissionId || null;
      this.projectNameFromPopup = this.config.data.projectName || null;
      
      // If in popup mode with a specific submission, pre-select it for evaluation
      if (this.submissionIdFromPopup) {
        this.submissionId = this.submissionIdFromPopup;
        this.projectEvaluationService.getSubmissionById(this.submissionIdFromPopup).subscribe({
          next: (submission: TeamSubmission) => {
            if (submission) {
              this.newEvaluation.teamSubmission = submission;
              this.evaluationForm.patchValue({
                teamSubmissionId: submission.id
              });
              this.cdr.detectChanges();
            }
          },
          error: (err: any) => {
            console.error('Error fetching submission:', err);
          }
        });
      }
    } else {
      // Check for query params if not in popup mode
      this.route.queryParams.subscribe(params => {
        const submissionId = params['submissionId'];
        if (submissionId) {
          this.submissionId = +submissionId;
          this.projectEvaluationService.getSubmissionById(+submissionId).subscribe({
            next: (submission: TeamSubmission) => {
              if (submission) {
                this.newEvaluation.teamSubmission = submission;
                this.evaluationForm.patchValue({
                  teamSubmissionId: submission.id
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
    }
    
    // Load team submissions for dropdown
    this.loadTeamSubmissions();
    
    // Load evaluations data
    this.loadEvaluations();
    this.loadTopRatedEvaluations();
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
        this.error = 'Error loading team submissions: ' + (err.message || 'Network error');
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
    this.loading = true;
    
    const formValues = this.evaluationForm.value;
    
    // Calculate total score (average of all scores, scaled to 100)
    const totalScore = Math.round(
      ((formValues.innovationScore + formValues.technicalScore + formValues.designScore) / 30) * 100
    );
    
    // Prepare evaluation object
    const evaluation: ProjectEvaluation = {
      score: totalScore,
      feedback: formValues.feedback,
      evaluationDate: new Date(),
      teamSubmission: { 
        id: formValues.teamSubmissionId,
        projectName: '', // These empty values will be populated by the backend
        description: '',
        repoLink: ''
      },
      evaluator: { id: 0 } // Current user ID will be set by backend
    };
    
    this.projectEvaluationService.createEvaluation(evaluation).subscribe({
      next: (response: string) => {
        if (this.isPopup) {
          // Show success message without alert in popup mode
          this.error = null;
          this.loading = false;
          this.submitting = false;
          // Close dialog with success result
          this.ref.close({ success: true });
        } else {
          alert(response || 'Evaluation submitted successfully!');
          this.resetForm();
          this.loadEvaluations();
          this.loadTopRatedEvaluations();
          this.loading = false;
          this.submitting = false;
        }
      },
      error: (err: any) => {
        this.error = 'Error creating evaluation: ' + (err.message || 'Network error');
        this.loading = false;
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
      innovationScore: 1,
      technicalScore: 1,
      designScore: 1
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
    this.clientSecret = null;
    this.cardElement = null;
    this.donationSuccess = false;
    this.cdr.detectChanges();
  }

  async initiateDonation(evaluationId: number): Promise<void> {
    console.log('Début de initiateDonation, evaluationId :', evaluationId, 'montant :', this.donationAmount);
    if (!this.donationAmount || this.donationAmount <= 0 || isNaN(this.donationAmount)) {
      this.error = 'Veuillez entrer un montant valide (nombre positif)';
      console.error('Montant invalide :', this.donationAmount);
      this.cdr.detectChanges();
      return;
    }
    if (evaluationId === undefined || evaluationId === null) {
      this.error = 'ID invalide pour le don';
      console.error('evaluationId invalide :', evaluationId);
      this.cdr.detectChanges();
      return;
    }

    const stripe = await this.stripePromise;
    if (!stripe) {
      this.error = "Erreur : Stripe n'est pas chargé";
      console.error('Stripe non chargé');
      this.cdr.detectChanges();
      return;
    }

    const elements = stripe.elements();
    this.cardElement = elements.create('card');
    this.cardElement.mount(`#card-element-${evaluationId}`);
    console.log('Card element monté pour evaluationId :', evaluationId);

    const payload = { amount: parseFloat(this.donationAmount.toFixed(2)) };
    console.log('Envoi au back-end :', payload);
    this.http.post<any>(`http://localhost:9100/api/payment/create-payment-intent/${evaluationId}`, payload).subscribe({
      next: (response: any) => {
        console.log('Réponse du back-end :', response);
        this.clientSecret = response.clientSecret;
        if (!this.clientSecret) {
          this.error = 'Erreur : ClientSecret non reçu';
          console.error('ClientSecret manquant dans la réponse');
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        console.error('Erreur HTTP :', err);
        this.error = 'Erreur lors de la préparation du don : ' + (err.error?.error || err.message || 'Erreur réseau');
        this.cdr.detectChanges();
      }
    });
  }

  async confirmDonation(evaluationId: number): Promise<void> {
    console.log('Début de confirmDonation, evaluationId :', evaluationId, 'clientSecret :', this.clientSecret, 'cardElement :', !!this.cardElement);
    if (!this.clientSecret || !this.cardElement) {
      this.error = 'Erreur : Don non initialisé correctement';
      console.error('Erreur : clientSecret ou cardElement manquant', { clientSecret: this.clientSecret, cardElement: this.cardElement });
      this.cdr.detectChanges();
      return;
    }

    const stripe = await this.stripePromise;
    if (!stripe) {
      this.error = "Erreur : Stripe n'est pas chargé";
      console.error('Erreur : Stripe non chargé');
      this.cdr.detectChanges();
      return;
    }

    console.log('Lancement de stripe.confirmCardPayment...');
    try {
      const result = await stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: { name: 'Donateur fictif' }
        }
      });

      console.log('Résultat complet de confirmCardPayment :', result);
      if (result.error) {
        this.error = 'Erreur lors du don : ' + result.error.message;
        console.error('Erreur Stripe :', result.error);
        this.cdr.detectChanges();
      } else if (result.paymentIntent?.status === 'succeeded') {
        console.log('Paiement réussi ! Montant :', this.donationAmount, '€');
        alert('Paiement réussi ! Montant : ' + this.donationAmount + ' € '); // Temporaire
        this.donationSuccess = true;
        this.donationEvaluationId = null;
        this.clientSecret = null;
        this.cardElement = null;
        this.cdr.detectChanges();
        console.log('donationSuccess défini à true, devrait afficher le message visuel');
        setTimeout(() => {
          console.log('Cacher le message de succès après 5 secondes');
          this.donationSuccess = false;
          this.cdr.detectChanges();
        }, 5000);
      } else {
        this.error = 'Don traité, mais statut inattendu : ' + result.paymentIntent?.status;
        console.warn('Statut inattendu :', result.paymentIntent?.status);
        this.cdr.detectChanges();
      }
    } catch (err: unknown) {
      this.error = 'Erreur inattendue lors du paiement : ' ;
      console.error('Erreur catchée dans confirmDonation :', err);
      this.cdr.detectChanges();
    }
  }

  cancelModification(): void {
    this.selectedEvaluation = null;
  }
}
