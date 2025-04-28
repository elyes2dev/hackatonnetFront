import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProjectEvaluationService } from '../../service/project-evaluation.service';
import { ProjectEvaluation } from '../../api/project-evaluation';
import { loadStripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-project-evaluation',
  templateUrl: './project-evaluation.component.html',
  styleUrls: ['./project-evaluation.component.scss']
})
export class ProjectEvaluationComponent implements OnInit {
  stripePromise = loadStripe('pk_test_51R9uQOCRTCCMntpfqwwnlonVcpy4gMnwyZamhJOGx8nhBfWWCQLlAw0ejgAVgrsEn4DnRNuyahhniFbXRYGy6TTq00Y20fwrAI');
  evaluations: ProjectEvaluation[] = [];
  topRatedEvaluations: ProjectEvaluation[] = [];
  loading = false;
  error: string | null = null;
  selectedEvaluation: ProjectEvaluation | null = null;
  minScore = 90;
  clientSecret: string | null = null;
  cardElement: any;
  donationAmount: number | null = null; // Montant personnalisé
  donationEvaluationId: number | null = null; // ID de l'évaluation pour le don
  donationSuccess = false; // Pour message visuel (optionnel)

  newEvaluation: ProjectEvaluation = {
    score: 0,
    feedback: '',
    evaluationDate: new Date(),
   // projectName: '',
    teamSubmission: { id: 0, projectName: '', description: '', repoLink: '' },
    evaluator: { id: 0 }
  };

  constructor(
    private http: HttpClient,
    private projectEvaluationService: ProjectEvaluationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEvaluations();
    this.loadTopRatedEvaluations();
  }

  loadEvaluations(): void {
    this.loading = true;
    this.error = null;
    console.log('Chargement des évaluations...');
    this.projectEvaluationService.getAllEvaluations().subscribe({
      next: (data) => {
        console.log('Evaluations reçues :', data);
        this.evaluations = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des évaluations : ' + (err.message || 'Erreur réseau');
        this.loading = false;
        console.error('Erreur :', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadTopRatedEvaluations(): void {
    this.loading = true;
    this.error = null;
    console.log('Chargement des projets les mieux notés avec minScore =', this.minScore);
    this.projectEvaluationService.getTopRatedProjects(this.minScore).subscribe({
      next: (data) => {
        console.log('Top rated reçus :', data);
        this.topRatedEvaluations = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des projets les mieux notés : ' + (err.message || 'Erreur réseau');
        this.loading = false;
        console.error('Erreur :', err);
        this.cdr.detectChanges();
      }
    });
  }

  createEvaluation(): void {
    console.log('Création de :', this.newEvaluation);
    this.projectEvaluationService.createEvaluation(this.newEvaluation).subscribe({
      next: (response: string) => {
        console.log('Réponse création :', response);
        alert(response);
        this.newEvaluation = {
          score: 0,
          feedback: '',
          evaluationDate: new Date(),
         // projectName: '',
          teamSubmission: { id: 0, projectName: '', description: '', repoLink: '' },
          evaluator: { id: 0 }
        };
        this.loadEvaluations();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors de la création : ' + (err.message || 'Erreur réseau');
        console.error('Erreur :', err);
        this.cdr.detectChanges();
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
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour : ' + (err.message || 'Erreur réseau');
          console.error('Erreur :', err);
          this.cdr.detectChanges();
        }
      });
    }
  }

  delete(id: number): void {
    if (id == null || id === undefined) {
      this.error = 'L\'ID de l\'évaluation est invalide.';
      this.cdr.detectChanges();
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      this.projectEvaluationService.deleteEvaluation(id).subscribe({
        next: () => {
          this.loadEvaluations();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression : ' + (err.message || 'Erreur réseau');
          console.error('Erreur :', err);
          this.cdr.detectChanges();
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
    this.error = null;
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
      next: (response) => {
        console.log('Réponse du back-end :', response);
        this.clientSecret = response.clientSecret;
        if (!this.clientSecret) {
          this.error = 'Erreur : ClientSecret non reçu';
          console.error('ClientSecret manquant dans la réponse');
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
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
        alert('Paiement réussi ! Montant : ' + this.donationAmount + ' €');
        this.donationSuccess = true;
        this.donationEvaluationId = null;
        this.clientSecret = null;
        this.cardElement = null;
        this.cdr.detectChanges();
        console.log('donationSuccess défini à true');
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
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      this.error = 'Erreur inattendue lors du paiement : ' + errorMessage;
      console.error('Erreur catchée dans confirmDonation :', err);
      this.cdr.detectChanges();
    }
  }

  cancelModification(): void {
    this.selectedEvaluation = null;
    this.cdr.detectChanges();
  }

  isTopRated(evaluation: ProjectEvaluation): boolean {
    return this.topRatedEvaluations.some(e => e.id === evaluation.id);
  }
}
