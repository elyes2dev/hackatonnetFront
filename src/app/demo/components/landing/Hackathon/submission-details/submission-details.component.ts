import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TeamSubmission } from 'src/app/demo/api/team-submission';
import { ProjectEvaluation } from 'src/app/demo/api/project-evaluation';
import { TeamSubmissionService } from 'src/app/demo/service/team-submission.service';
import { ProjectEvaluationService } from 'src/app/demo/service/project-evaluation.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LandingProjectEvaluationComponent } from '../../landing-project-evaluation/landing-project-evaluation.component';
import { ProjectEvaluationComponent } from 'src/app/demo/components/project-evaluation/project-evaluation.component';
import { UserService } from 'src/app/demo/services/user.service';
import { User } from 'src/app/demo/models/user.model';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from 'src/app/demo/services/auth.service';
import { StorageService } from 'src/app/demo/services/storage.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
  selector: 'app-submission-details',
  templateUrl: './submission-details.component.html',
  styleUrls: ['./submission-details.component.scss'],
  providers: [DialogService, MessageService],
  imports: [CommonModule, ToastModule, ButtonModule, TooltipModule],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Add schema to handle custom elements

  
})
export class SubmissionDetailsComponent implements OnInit {

  isSponsor = false;
  isMentor = false; 

  userId: string | null = null;
  isAuthenticated: boolean = this.authService.isAuthenticated();
  isAdmin = false;
  isStudent = false;
  userMenuVisible = false; // Property to control dropdown visibility

  // Helper methods for template type safety
  isDonationPositive(donation: number | undefined): boolean {
    return donation !== undefined && donation > 0;
  }
  
  getEvaluatorDisplay(evaluator: any): string {
    return evaluator && evaluator.id ? 'User ' + evaluator.id : 'Anonymous';
  }
  
  getTechnologiesArray(technologies: string | undefined): string[] {
    return technologies ? technologies.split(',') : [];
  }
  submissionId: number | null = null;
  submission: TeamSubmission | null = null;
  evaluations: ProjectEvaluation[] = [];
  loading = false;
  error: string | null = null;
  user: User | null = null;
  isSubmissionOwner = false;
  hackathonName: string | null = null;
  
  // Donation related properties
  donationAmount: number = 0;
  showDonationForm = false;
  stripePromise = loadStripe('pk_test_51R9uQOCRTCCMntpfqwwnlonVcpy4gMnwyZamhJOGx8nhBfWWCQLlAw0ejgAVgrsEn4DnRNuyahhniFbXRYGy6TTq00Y20fwrAI', {
    stripeAccount: undefined,
    apiVersion: '2022-11-15' // Specify a fixed API version
  });
  clientSecret: string | null = null;
  cardElement: StripeCardElement | null = null;
  stripeElements: StripeElements | null = null;
  stripe: Stripe | null = null;
  paymentProcessing = false;
  donationSuccess = false;
  
  // Evaluation chart data
  chartData: any;
  chartOptions: any;
  
  // Dialog reference
  dialogRef: DynamicDialogRef | null = null;

  username = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
        private teamSubmissionService: TeamSubmissionService,
    private projectEvaluationService: ProjectEvaluationService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private userService: UserService,
        public layoutService: LayoutService,
        private storageService: StorageService,
        private authService: AuthService,
  ) { }

  ngOnInit(): void {


    this.loading = true;
    
    // Get current user from service
    const userId = this.userService.getLoggedUserId();
    if (userId) {
      this.userService.getUserById(Number(userId)).subscribe(user => {
        this.user = user;
        this.username = user.name;
        // Check if user has SPONSOR role
        this.isSponsor = this.user.roles?.some(role => role.name === 'SPONSOR') || false;
        this.isMentor = this.user.roles?.some(role => role.name === 'MENTOR') || false;
      }, err => {
        console.error('Error fetching current user:', err);
      });

    }
    // Get submission ID from route params
    this.route.params.subscribe(params => {
      this.submissionId = +params['id'];
      if (this.submissionId) {
        this.loadSubmissionDetails();
      } else {
        this.error = 'Invalid submission ID';
        this.loading = false;
      }
    });
  }
  

  // Add navigation methods to make the template cleaner
  navigateTo(path: string, fragment?: string) {
    if (fragment) {
      this.router.navigate([path], { fragment: fragment });
    } else {
      this.router.navigate([path]);
    }
  }
  loadSubmissionDetails(): void {
    if (!this.submissionId) return;
    
    this.teamSubmissionService.getSubmissionById(this.submissionId).subscribe({
      next: (submission: TeamSubmission) => {
        this.submission = submission;
        // Check if current user is the owner
        if (this.user && this.submission.teamMember && this.user.id === this.submission.teamMember.id) {
          this.isSubmissionOwner = true;
        }
        this.loadEvaluations();
      },
      error: (err: any) => {
        this.error = 'Failed to load submission details';
        this.loading = false;
        console.error('Error loading submission:', err);
      }
    });
  }

  loadEvaluations(): void {
    if (!this.submissionId) return;
    
    // Get evaluations for this submission
    // Since there's no direct method for getting evaluations by submission ID,
    // we'll get all evaluations and filter them
    this.projectEvaluationService.getAllEvaluations().subscribe({
      next: (evaluations: ProjectEvaluation[]) => {
        // Filter evaluations for this submission
        this.evaluations = evaluations.filter(evaluation => 
          evaluation.teamSubmission && evaluation.teamSubmission.id === this.submissionId
        );
        this.loading = false;
        this.prepareChartData();
      },
      error: (err: any) => {
        this.error = 'Failed to load evaluations';
        this.loading = false;
        console.error('Error loading evaluations:', err);
      }
    });
  }

  prepareChartData(): void {
    if (!this.evaluations || this.evaluations.length === 0) return;
    
    const labels = this.evaluations.map((_, index) => `Evaluation ${index + 1}`);
    const scores = this.evaluations.map(evaluation => evaluation.score);
    
    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Evaluation Scores',
          data: scores,
          fill: false,
          borderColor: '#2196F3',
          tension: 0.4
        }
      ]
    };
    
    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Evaluation Score Trend'
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 10
          }
        }
      }
    };
  }

  getAverageScore(): number {
    if (!this.evaluations || this.evaluations.length === 0) return 0;
    const sum = this.evaluations.reduce((acc, evaluation) => acc + evaluation.score, 0);
    return Math.round((sum / this.evaluations.length) * 10) / 10;
  }
  
  getScoreClass(score: number): string {
    if (score >= 80) return 'high-score';
    if (score >= 50) return 'medium-score';
    return 'low-score';
  }

  openEvaluationDialog(): void {
    if (!this.submissionId) return;
    
    // Check if user is logged in
    if (!this.user) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'You must be logged in to evaluate projects'
      });
      return;
    }
    
    // Check if user is the submission owner
    if (this.isSubmissionOwner) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'You cannot evaluate your own project'
      });
      return;
    }
    
    // Open the evaluation dialog
    this.dialogRef = this.dialogService.open(ProjectEvaluationComponent, {
      header: 'Evaluate Project: ' + this.submission?.projectName,
      width: '70%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: {
        submissionId: this.submissionId,
        projectName: this.submission?.projectName,
        hackathonName: this.hackathonName,
        userId: this.user.id
      }
    });
    
    this.dialogRef.onClose.subscribe((result) => {
      if (result) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Project evaluation submitted successfully!'
        });
      }
      // Reload evaluations when dialog is closed
      this.loadEvaluations();
    });
  }

  toggleDonationForm(): void {
    this.showDonationForm = !this.showDonationForm;
    
    if (this.showDonationForm) {
      // Reset donation amount and form state
      this.donationAmount = 0;
      this.clientSecret = null;
      this.cardElement = null;
      this.paymentProcessing = false;
      this.donationSuccess = false;
    }
  }

  async initializeStripeElements(): Promise<void> {
    if (!this.clientSecret) return;
    
    const stripe = await this.stripePromise;
    if (!stripe) return;
    
    this.stripe = stripe;
    const elements = stripe.elements();
    this.stripeElements = elements;
    
    const style = {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };
    
    const cardElement = elements.create('card', { style });
    cardElement.mount('#card-element');
    
    this.cardElement = cardElement;
  }

  async handlePayment(): Promise<void> {
    if (!this.clientSecret || !this.cardElement || !this.stripe) {
      this.messageService.add({
        severity: 'error',
        summary: 'Payment Error',
        detail: 'Payment setup is incomplete. Please try again.'
      });
      return;
    }
    
    this.paymentProcessing = true;
    
    const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret, {
      payment_method: {
        card: this.cardElement,
        billing_details: {
          name: this.user?.id ? 'User ' + this.user.id : 'Anonymous'
        }
      }
    });
    
    if (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Payment Error',
        detail: error.message || 'An error occurred during payment processing.'
      });
      this.paymentProcessing = false;
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Mock implementation for donation update
      setTimeout(() => {
        this.donationSuccess = true;
        this.showDonationForm = false;
        this.paymentProcessing = false;
        
        // Update the local submission object
        if (this.submission) {
          this.submission.donationAmount = (this.submission.donationAmount || 0) + this.donationAmount;
        }
        
        this.messageService.add({
          severity: 'success',
          summary: 'Donation Successful',
          detail: `Thank you for your $${this.donationAmount} donation!`
        });
      }, 1000);
      
      // In a real implementation, you would update the database
      // this.teamSubmissionService.updateSubmission(this.submissionId, {...}).subscribe(...)
    }
  }

  goBack(): void {
    this.router.navigate(['/landing-hackathons']);
  }
   navigateToLanding() {
      this.router.navigate(['/landing']);
    }
  
      navigateToTeamSubmission(): void {
          this.router.navigate(['/team-submission']); // Navigation directe vers /team-submission
      }
    getBadgeIcon(): string {
      const badgeIcons: Record<string, string> = {
        JUNIOR_COACH: 'assets/demo/images/avatar/JUNIOR_COACH.png',
        ASSISTANT_COACH: 'assets/demo/images/avatar/ASSISTANT_COACH.png',
        SENIOR_COACH: 'assets/demo/images/avatar/SENIOR_COACH.png',
        HEAD_COACH: 'assets/demo/images/avatar/HEAD_COACH.png',
        MASTER_MENTOR: 'assets/demo/images/avatar/MASTER_MENTOR.png'
      };
      return this.user ? badgeIcons[this.user.badge] || 'assets/icons/default_badge.png' : '';
    }
  
    viewOrCreateMentorApplication(): void {
      const userId = this.storageService.getLoggedInUserId();
      if (this.isMentor) {
        // Navigate to view their existing application
        this.router.navigate(['/mentor-applications/user', userId]);
      } else {
        // Navigate to create a new application
        this.router.navigate(['/mentor-applications/new']);
      }}
      
    logout()
    {
        this.authService.logout();
        this.storageService.clearAll();
        window.location.reload();
        this.userMenuVisible = false;
    }
    
    // Toggle user menu dropdown visibility
    toggleUserMenu(event: Event): void {
      event.stopPropagation();
      this.userMenuVisible = !this.userMenuVisible;
    }
    
    // Close user menu dropdown
    closeUserMenu(): void {
      this.userMenuVisible = false;
    }
    
    // Close dropdown when clicking outside
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
      // Check if the click is outside the dropdown area
      const clickedElement = event.target as HTMLElement;
      const dropdown = document.querySelector('.user-dropdown');
      
      if (dropdown && !dropdown.contains(clickedElement)) {
        this.userMenuVisible = false;
      }
    }
}

