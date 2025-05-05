import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DonationService } from '../../service/donation.service';

declare var Stripe: any;

@Component({
  selector: 'app-donation-dialog',
  templateUrl: './donation-dialog.component.html',
  styleUrls: ['./donation-dialog.component.scss']
})
export class DonationDialogComponent implements OnInit {
  donationForm!: FormGroup;
  loading = false;
  stripe: any;
  card: any;
  cardErrors: string = '';
  teamSubmissionId: string = '';
  teamSubmission: any;
  
  // Predefined donation amounts
  donationAmounts: number[] = [5, 10, 20, 50, 100];
  customAmount = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageService: MessageService,
    private http: HttpClient,
    private donationService: DonationService
  ) { }

  ngOnInit(): void {
    // Get the team submission from dialog config
    this.teamSubmission = this.config.data?.teamSubmission;
    this.teamSubmissionId = this.teamSubmission?.id;
    
    if (!this.teamSubmissionId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No team submission provided for donation'
      });
      this.closeDialog();
    }

    this.initForm();
    this.initStripe();
  }

  initForm(): void {
    this.donationForm = this.fb.group({
      amount: [10, [Validators.required, Validators.min(1)]],
      customAmount: [false],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['']
    });

    // Listen for changes to the customAmount control
    this.donationForm.get('customAmount')?.valueChanges.subscribe(value => {
      this.customAmount = value;
      if (!value) {
        // Reset to a predefined amount if custom is deselected
        this.donationForm.get('amount')?.setValue(10);
      }
    });
  }

  initStripe(): void {
    try {
      // Initialize Stripe with your publishable key
      this.stripe = Stripe(environment.stripePublishableKey);
      const elements = this.stripe.elements();

      // Create a card element
      this.card = elements.create('card');
      
      // Add the card element to the DOM
      setTimeout(() => {
        try {
          this.card.mount('#card-element');
          
          // Handle card validation errors
          this.card.addEventListener('change', (event: any) => {
            this.cardErrors = event.error ? event.error.message : '';
          });
        } catch (error) {
          console.error('Error mounting card element:', error);
          this.cardErrors = 'Could not initialize payment form. Please try again later.';
        }
      }, 100);
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      this.cardErrors = 'Could not initialize payment system. Please try again later.';
    }
  }

  selectAmount(amount: number): void {
    this.donationForm.get('amount')?.setValue(amount);
    this.donationForm.get('customAmount')?.setValue(false);
  }

  toggleCustomAmount(): void {
    const currentValue = this.donationForm.get('customAmount')?.value;
    this.donationForm.get('customAmount')?.setValue(!currentValue);
  }

  async processDonation(): Promise<void> {
    if (this.donationForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields and provide valid payment information'
      });
      return;
    }

    this.loading = true;

    try {
      // For demo purposes, we'll simulate a successful payment without actually charging a card
      // In a real implementation, you would use Stripe to process the payment
      
      // Create a payment intent using our mock service
      const paymentIntentResponse = await this.donationService.createPaymentIntent(
        this.donationForm.get('amount')?.value || 0,
        this.teamSubmissionId,
        `Donation for ${this.teamSubmission.projectName}`
      ).toPromise();
      
      // Simulate a successful payment confirmation
      // In a real implementation, you would use Stripe.confirmCardPayment here
      
      // For demo purposes, we'll just simulate a successful payment
      setTimeout(() => {
        // The payment succeeded!
        this.messageService.add({
          severity: 'success',
          summary: 'Donation Successful',
          detail: `Thank you for your donation of $${this.donationForm.get('amount')?.value}!`
        });
        
        // Record the donation in the database
        this.recordDonation(paymentIntentResponse.id);
      }, 1500);
      
    } catch (error) {
      console.error('Error processing donation:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'An error occurred while processing your donation. Please try again.'
      });
      this.loading = false;
    }
  }

  // This method is now handled by the DonationService

  async recordDonation(paymentIntentId: string): Promise<any> {
    const formValue = this.donationForm.value;
    
    try {
      const donationResult = await this.donationService.recordDonation({
        teamSubmissionId: this.teamSubmissionId,
        amount: formValue.amount,
        paymentIntentId: paymentIntentId,
        donorName: formValue.name,
        donorEmail: formValue.email,
        message: formValue.message
      }).toPromise();
      
      // Close the dialog after successful donation recording
      this.closeDialog(true);
      return donationResult;
    } catch (error) {
      console.error('Error recording donation:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  closeDialog(success = false): void {
    this.dialogRef.close(success);
  }
}
