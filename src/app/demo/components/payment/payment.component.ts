
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe } from '@stripe/stripe-js';


@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  stripe: any;  // Stripe.js
  elements: any;  // Elements.js
  paymentIntentClientSecret: string | null = null;  // Clé client pour Stripe

  constructor(private http: HttpClient) {}

  async ngOnInit(): Promise<void> {
    // Charger Stripe.js avec ta clé publique
    this.stripe = await loadStripe('pk_test_51R9uQOCRTCCMntpfqwwnlonVcpy4gMnwyZamhJOGx8nhBfWWCQLlAw0ejgAVgrsEn4DnRNuyahhniFbXRYGy6TTq00Y20fwrAI'); // remplace par ta clé publique
  
    if (this.stripe) {
      this.elements = this.stripe.elements();  // Initialiser Stripe Elements
    } else {
      console.error('Erreur lors du chargement de Stripe');
    }
  }
  
  // Fonction pour demander la création du PaymentIntent côté backend
  createPaymentIntent(evaluationId: number): void {
    this.http.post<any>(`/pi/api/payment/create-payment-intent/${evaluationId}`, {}).subscribe(
      data => {
        this.paymentIntentClientSecret = data.clientSecret;  // Récupérer le clientSecret
        this.confirmPayment();  // Lancer le processus de confirmation du paiement
      },
      error => {
        console.error('Erreur lors de la création du PaymentIntent', error);
      }
    );
  }

  // Fonction pour confirmer le paiement avec Stripe
  confirmPayment(): void {
    if (!this.paymentIntentClientSecret) {
      console.error('ClientSecret manquant');
      return;
    }

    // Créer un élément de carte
    const card = this.elements.create('card');
    card.mount('#card-element');  // Place l'élément de la carte dans le DOM

    // Confirmer le paiement avec le clientSecret
    this.stripe.confirmCardPayment(this.paymentIntentClientSecret, {
      payment_method: {
        card: card,  // Utiliser l'élément de carte créé ci-dessus
      },
    }).then((result: any) => {
      if (result.error) {
        console.error('Erreur de paiement', result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          alert('Paiement effectué avec succès');
        }
      }
    });
  }
}