import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { PostListComponent } from 'src/app/demo/components/posts/post-list/post-list.component';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { UserService } from 'src/app/demo/services/user.service';
import { User } from 'src/app/demo/models/user.model';
import { StorageService } from 'src/app/demo/services/storage.service';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ListMentorService } from 'src/app/demo/services/list-mentor.service';
import { ListMentorFormComponent } from '../../../list-mentor/list-mentor-form/list-mentor-form.component';
import { Team } from 'src/app/demo/models/team';
import { finalize, Subject, takeUntil } from 'rxjs';
import { TeamService } from 'src/app/demo/services/team.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TeamFrontofficeComponent } from '../../../team-frontoffice/team-frontoffice.component';
import { ListMentor } from 'src/app/demo/models/list-mentor.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { MentorDetailsDialogComponent } from '../mentor-details-dialog/mentor-details-dialog.component';
import { Prize, PrizeCategory } from 'src/app/demo/models/prize';
import { PrizeService } from 'src/app/demo/services/prize.service';
import { ApplicationStatus } from 'src/app/demo/models/application-status';
import { TeamSubmissionService } from 'src/app/demo/service/team-submission.service';
import { TeamSubmission } from 'src/app/demo/api/team-submission';
import { loadStripe } from '@stripe/stripe-js';
import { LandingProjectEvaluationComponent } from '../../landing-project-evaluation/landing-project-evaluation.component';
import { AuthService } from 'src/app/demo/services/auth.service';

@Component({
  selector: 'app-landing-hackathon-details',
  templateUrl: './landing-hackathon-details.component.html',
  styleUrls: ['./landing-hackathon-details.component.scss'],
  providers: [DialogService, MessageService],
  animations: [
    trigger('sectionAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ])
  ],

})
export class LandingHackathonDetailsComponent implements OnInit {
  @ViewChild(PostListComponent) postListComponent!: PostListComponent;
  hackathon: Hackathon | null = null;
  display = false;
  displayPostForm = false;
  
  user!: User;
  isSponsor = false;
  isAlreadyMentor = false;
  existingMentorListing: any = null;
  dialogRef: DynamicDialogRef | undefined;
  userTeam: Team | null = null;
  private destroy$ = new Subject<void>();
  loading = false;
  loadingDialog = false;
  private ref: DynamicDialogRef | null = null;
  numberOfMentors: number = 0;
  mentorsList: ListMentor[] = [];
  // Add to your component class
  activeSection: 'teams' | 'prizes' | 'mentors' | null = 'teams';


  isMentor = false; 

  userId: string | null = null;
  isAuthenticated: boolean = this.authService.isAuthenticated();
  isAdmin = false;
  isStudent = false;
  userMenuVisible = false; // Property to control dropdown visibility

  // Add these methods to toggle sections
  showSection(section: 'teams' | 'prizes' | 'mentors'): void {
    this.activeSection = this.activeSection === section ? null : section;
  }

  isActiveSection(section: 'teams' | 'prizes' | 'mentors'): boolean {
    return this.activeSection === section;
  }

  // Add a property to store prizes
  prizes: Prize[] = [];
  prizeCount: number = 0;
  
  // Team Submissions
  teamSubmissions: TeamSubmission[] = [];
  loadingSubmissions = false;
  submissionError: string | null = null;
  showSubmissionForm = false;
  newSubmission: TeamSubmission = {
    projectName: '',
    description: '',
    repoLink: '',
    teamMember: { id: 0 },
    technologies: '',
    hackathonId: 0
  };
  
  // Submission details
  selectedSubmission: TeamSubmission | null = null;
  showSubmissionDetailsDialog = false;
  isSubmissionOwner = false;
  donationAmount: number = 0;
  showDonationForm = false;
  
  // Stripe payment
  stripePromise = loadStripe('pk_test_51R9uQOCRTCCMntpfqwwnlonVcpy4gMnwyZamhJOGx8nhBfWWCQLlAw0ejgAVgrsEn4DnRNuyahhniFbXRYGy6TTq00Y20fwrAI');
  clientSecret: string | null = null;
  cardElement: any;
  paymentProcessing = false;
  donationSuccess = false;
  
  // Carousel responsive options for submissions
  submissionCarouselResponsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private hackathonService: HackathonService,
    public router: Router,
    public layoutService: LayoutService, 
    private userService: UserService,
    private storageService: StorageService,
    private dialogService: DialogService,
    private listMentorService: ListMentorService,
    private messageService: MessageService,
    private teamService: TeamService,
    private prizeService: PrizeService ,// Add the prize service

        private authService: AuthService,



    private teamSubmissionService: TeamSubmissionService,
    private http: HttpClient
  ) {}

  username = '';
  applicationsMenuVisible = false;

  ngOnInit(): void {
    // Get the 'id' parameter from the route
    this.userMenuVisible = false;
    this.applicationsMenuVisible = false;
    const hackathonId = this.route.snapshot.paramMap.get('id');
    if (hackathonId) {
      // Fetch the hackathon details based on the ID
      this.hackathonService.getHackathonById(hackathonId).subscribe((data: Hackathon) => {
        this.hackathon = data;
        const cachedTeam = this.getCachedUserTeam(+hackathonId);
        if (cachedTeam) {
            this.userTeam = cachedTeam;
        } else {
            // If no cached team, check if user is in a team for this hackathon
            this.checkUserTeam(+hackathonId);
        }
        this.checkMentorStatus();
        this.fetchNumberOfMentors(+hackathonId);

        // Fetch prizes count for this hackathon
        this.getPrizesCount(Number(hackathonId));
        // Fetch prizes for this hackathon
        this.loadPrizes(Number(hackathonId));
        
        // Load team submissions for this hackathon
        this.loadTeamSubmissions(+hackathonId);
      });
    }
    // Get logged in user for badge icon
    const userId = this.storageService.getLoggedInUserId();
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (userData: User) => {
          this.user = userData;
          
          // Check for SPONSOR role in user data
          if (userData.roles) {
            // Handle both array of Role objects and array of strings
            this.isSponsor = userData.roles.some(role => {
              if (typeof role === 'string') {
                return role === 'SPONSOR';
              } else if (role && typeof role === 'object') {
                return role.name === 'SPONSOR';
              }
              return false;
            });
          }
        },
        error: (err) => console.error('Error fetching user data:', err)
      });
    }
  }
  private cacheUserTeam(team: Team | null, hackathonId: number): void {
    const cacheKey = `user_team_${this.user?.id}_${hackathonId}`;
    if (team) {
        localStorage.setItem(cacheKey, JSON.stringify(team));
    } else {
        localStorage.removeItem(cacheKey);
    }
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


  
 // Method to toggle applications dropdown
toggleApplicationsMenu(event: Event) {
  event.stopPropagation();
  this.applicationsMenuVisible = !this.applicationsMenuVisible;
  
  // Close user menu if open
  if (this.applicationsMenuVisible && this.userMenuVisible) {
    this.userMenuVisible = false;
  }
}

// Method to toggle user menu dropdown
toggleUserMenu(event: Event) {
  event.stopPropagation();
  this.userMenuVisible = !this.userMenuVisible;
  
  // Close applications menu if open
  if (this.userMenuVisible && this.applicationsMenuVisible) {
    this.applicationsMenuVisible = false;
  }
}


// Close both dropdowns when clicking outside
@HostListener('document:click', ['$event'])
handleDocumentClick(event: MouseEvent) {
  // Get references to your dropdown elements
  const userMenuButton = document.querySelector('.badge-icon');
  const userDropdownMenu = document.querySelector('.user-dropdown-menu');
  const applicationsMenuButton = document.querySelector('.applications-toggle');
  const applicationsDropdown = document.querySelector('.applications-dropdown');
  
  // Close user menu if click is outside
  if (userMenuButton && !userMenuButton.contains(event.target as Node) && 
      userDropdownMenu && !userDropdownMenu.contains(event.target as Node) &&
      this.userMenuVisible) {
    this.userMenuVisible = false;
  }
  
  // Close applications menu if click is outside
  if (applicationsMenuButton && !applicationsMenuButton.contains(event.target as Node) && 
      applicationsDropdown && !applicationsDropdown.contains(event.target as Node) &&
      this.applicationsMenuVisible) {
    this.applicationsMenuVisible = false;
  }
} 

  navigateToTeamSubmission(): void {
      this.router.navigate(['/team-submission']); // Navigation directe vers /team-submission
  }


  private getCachedUserTeam(hackathonId: number): Team | null {
    const cacheKey = `user_team_${this.user?.id}_${hackathonId}`;
    const cachedData = localStorage.getItem(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
}


private fetchNumberOfMentors(hackathonId: number): void {
  this.listMentorService.getListMentorsByHackathonId(hackathonId).subscribe({
    next: (mentors) => {
      this.mentorsList = mentors; // Store the actual mentor listings
      this.numberOfMentors = mentors.length;
      console.log('Fetched mentors:', mentors); // Debug log
    },
    error: (error) => {
      console.error('Error fetching mentors:', error);
      this.numberOfMentors = 0;
      this.mentorsList = [];
    }
  });
}
private checkUserTeam(hackathonId: number): void {
  if (!this.user?.id) return;

  this.loading = true;
  this.teamService.getAllTeams().pipe(
      finalize(() => this.loading = false),
      takeUntil(this.destroy$)
  ).subscribe({
      next: (teams: Team[]) => {
          const team = teams.find(t =>
              t.hackathon?.id === hackathonId &&
              t.teamMembers?.some(member => member.user?.id === this.user?.id)
          );

          if (team) {
              this.userTeam = team;
              this.cacheUserTeam(team, hackathonId);
          } else {
              this.userTeam = null;
              this.cacheUserTeam(null, hackathonId);
          }
      },
      error: (error: HttpErrorResponse) => {
          console.error('Error checking user team:', error);
          this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to check team membership'
          });
      }
  });
}
participate() {
    if (!this.hackathon || this.loadingDialog || this.ref) {
        console.log('Participate blocked:', { hackathon: !!this.hackathon, loadingDialog: this.loadingDialog, dialogOpen: !!this.ref });
        return;
    }

    this.loadingDialog = true;
    const mode = this.userTeam ? 'chat' : 'participate';
    this.ref = this.dialogService.open(TeamFrontofficeComponent, {
        header: this.userTeam ? `Team Chat - ${this.userTeam.teamName}` : 'Participate in Hackathon',
        style: {
            width: this.userTeam ? '400px' : '60vw',
            maxWidth: this.userTeam ? '400px' : '700px',
            color: '#6200EA',
            'font-family': 'Poppins, Arial, sans-serif',
            'font-size': '0.95rem',
            'font-weight': '600',
            'letter-spacing': '0.5px',
            'height': this.userTeam ? '500px' : 'auto',
            'max-height': this.userTeam ? '500px' : '600px',
            'background': 'linear-gradient(135deg, #ffffff 0%, #f5f0ff 100%)',
            'box-shadow': '0 8px 30px rgba(98, 0, 234, 0.15), 0 4px 15px rgba(98, 0, 234, 0.1)',
            'border-radius': '16px',
            'border': '1px solid #d0b3ff',
            'overflow': 'hidden',
            'padding': '0',
            'position': 'relative',
            'top': '50%',
            'transform': 'translateY(-50%)',
            'margin': '0 auto'
        },
        styleClass: 'modern-dialog hackathon-dialog ' + (this.userTeam ? 'team-chat-dialog' : 'participate-dialog'),
        contentStyle: {
            'padding': '0',
            'border-radius': '20px',
            'overflow-y': 'auto',
            'overflow-x': 'hidden',
            'height': '100%',
            'scrollbar-width': 'thin',
            'scrollbar-color': '#d0b3ff #f5f0ff'
        },
        maximizable: true,
        closeOnEscape: true,
        dismissableMask: true,
        modal: true,
        baseZIndex: 1000,
        data: {
            hackathonId: this.hackathon.id,
            mode,
            teamId: this.userTeam?.id
        }
    });

    this.ref.onClose.pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
        console.log('Dialog closed with result:', result);
        if (result === 'left') {
            // User left the team
            this.userTeam = null;
            this.cacheUserTeam(null, this.hackathon!.id);
            this.messageService.add({
                severity: 'info',
                summary: 'Info',
                detail: 'You have left the team'
            });
            window.location.reload(); // Refresh the page after leaving team
        } else if (result) {
            // User joined a new team
            this.userTeam = result;
            this.cacheUserTeam(result, this.hackathon!.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `You are now part of team "${result.teamName}"`
            });
            window.location.reload(); // Refresh the page after joining/creating team
        }
        this.ref = null;
        this.loadingDialog = false;
    });
}
getParticipateButtonLabel(): string {
  return this.userTeam ? 'Open Team Chat' : 'Participate';
}

getParticipateButtonIcon(): string {
  return this.userTeam ? 'pi pi-comments' : 'pi pi-users';
}

public get dialogHeader(): string {
  if (this.ref && (this.ref as any).options && (this.ref as any).options.header) {
      return (this.ref as any).options.header;
  }
  return '';
}

// Team Submissions Methods
loadTeamSubmissions(hackathonId: number | undefined): void {
  if (hackathonId === undefined) {
    this.submissionError = 'Invalid hackathon ID';
    return;
  }
  
  this.loadingSubmissions = true;
  this.submissionError = null;
  this.teamSubmissionService.getSubmissionsByHackathonId(hackathonId as number).subscribe({
    next: (data) => {
      this.teamSubmissions = data || [];
      this.loadingSubmissions = false;
    },
    error: (err) => {
      this.submissionError = 'Error loading team submissions: ' + (err.message || 'Network error');
      this.loadingSubmissions = false;
    }
  });
}

toggleSubmissionForm(): void {
  this.showSubmissionForm = !this.showSubmissionForm;
  if (this.showSubmissionForm && this.user && this.userTeam && this.user.id !== undefined) {
    // Pre-fill the team member ID with the current user's ID
    this.newSubmission.teamMember = { id: this.user.id as number };
  }
}

createSubmission(): void {
  if (!this.user || !this.userTeam) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'You must be part of a team to submit a project'
    });
    return;
  }
  
  // Ensure we have a valid hackathon (for validation only, not sent to API)
  if (!this.hackathon || this.hackathon.id === undefined) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Hackathon ID is missing'
    });
    return;
  }
  
  // Find the correct team member ID from the user's team
  if (this.userTeam && this.userTeam.teamMembers && this.user && this.user.id !== undefined) {
    const teamMember = this.userTeam.teamMembers.find(member => member.user?.id === this.user.id);
    if (teamMember && teamMember.id) {
      this.newSubmission.teamMember = { id: teamMember.id };
      console.log('Using team member ID:', teamMember.id);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not find your team member record'
      });
      return;
    }
  } else {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'User ID is missing or you are not part of a team'
    });
    return;
  }
  
  // Ensure user is part of a team (for validation only, not sent to API)
  if (!this.userTeam || this.userTeam.id === undefined) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Team ID is missing, please join a team first'
    });
    return;
  }
  
  console.log('Submitting project with data:', this.newSubmission);
  
  this.loadingSubmissions = true;
  this.teamSubmissionService.createSubmission(this.newSubmission).subscribe({
    next: (response) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Project submitted successfully!'
      });
      // Reset the submission form with the correct team member ID
      let teamMemberId = 0;
      if (this.userTeam && this.userTeam.teamMembers && this.user && this.user.id !== undefined) {
        const teamMember = this.userTeam.teamMembers.find(member => member.user?.id === this.user.id);
        if (teamMember && teamMember.id) {
          teamMemberId = teamMember.id;
        }
      }
      
      this.newSubmission = {
        projectName: '',
        description: '',
        repoLink: '',
        teamMember: { id: teamMemberId }
        // Note: technologies, hackathonId and teamId are not included as they're not recognized by the backend
      };
      this.showSubmissionForm = false;
      // Reload submissions
      if (this.hackathon && this.hackathon.id !== undefined) {
        this.loadTeamSubmissions(this.hackathon.id as number);
      }
      this.loadingSubmissions = false;
    },
    error: (err) => {
      console.error('Submission error:', err);
      let errorMessage = 'Error creating submission';
      
      if (err.error && typeof err.error === 'string') {
        errorMessage += ': ' + err.error;
      } else if (err.message) {
        errorMessage += ': ' + err.message;
      } else if (err.status === 400) {
        errorMessage += ': Bad request. Please check that all required fields are filled correctly.';
      } else {
        errorMessage += ': Network error or server issue';
      }
      
      this.submissionError = errorMessage;
      this.messageService.add({
        severity: 'error',
        summary: 'Submission Failed',
        detail: errorMessage
      });
      this.loadingSubmissions = false;
    }
  });
}

canUserSubmit(): boolean {
  return !!this.user && !!this.userTeam;
}

// Submission details methods
  showSubmissionDetails(submission: TeamSubmission): void {
    this.selectedSubmission = submission;
    // Navigate to the submission details page instead of showing a dialog
    this.router.navigate(['/submission-details', submission.id]);
  }
  
  navigateToSubmissionDetails(submission: TeamSubmission): void {
    if (submission && submission.id) {
      this.router.navigate(['/submission-details', submission.id]);
    }
  }

updateSubmission(): void {
  if (!this.selectedSubmission || !this.selectedSubmission.id) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Invalid submission data'
    });
    return;
  }
  
  this.loadingSubmissions = true;
  this.teamSubmissionService.updateSubmission(this.selectedSubmission.id, this.selectedSubmission).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Submission updated successfully!'
      });
      this.closeSubmissionDetails();
      // Reload submissions
      if (this.hackathon && this.hackathon.id !== undefined) {
        this.loadTeamSubmissions(this.hackathon.id as number);
      }
      this.loadingSubmissions = false;
    },
    error: (err) => {
      this.submissionError = 'Error updating submission: ' + (err.message || 'Network error');
      this.loadingSubmissions = false;
    }
  });
}

closeSubmissionDetails(): void {
  this.showSubmissionDetailsDialog = false;
  this.selectedSubmission = null;
  this.showDonationForm = false;
  this.clientSecret = null;
  this.donationAmount = 0;
}

evaluateSubmission(): void {
  if (!this.selectedSubmission || !this.selectedSubmission.id) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No submission selected'
    });
    return;
  }
  
  // Close the current dialog
  this.showSubmissionDetailsDialog = false;
  
  // Open project evaluation in a dialog instead of navigating
  this.ref = this.dialogService.open(LandingProjectEvaluationComponent, {
    header: 'Evaluate Project: ' + this.selectedSubmission.projectName,
    width: '70%',
    contentStyle: { overflow: 'auto' },
    baseZIndex: 10000,
    maximizable: true,
    data: {
      submissionId: this.selectedSubmission.id,
      projectName: this.selectedSubmission.projectName,
      isPopup: true
    }
  });
  
  // Handle dialog close
  this.ref.onClose.subscribe(() => {
    // Refresh submissions list to show updated evaluations
    if (this.hackathon && this.hackathon.id) {
      this.loadTeamSubmissions(this.hackathon.id);
    }
  });
}

toggleDonationForm(): void {
  this.showDonationForm = !this.showDonationForm;
  if (!this.showDonationForm) {
    this.donationAmount = 0;
  }
}

processDonation(): void {
  if (!this.selectedSubmission || !this.donationAmount || this.donationAmount <= 0) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Please enter a valid donation amount'
    });
    return;
  }
  
  this.paymentProcessing = true;
  
  // Create a payment intent on the server using the correct endpoint
  this.http.post<{clientSecret: string}>(`http://localhost:9100/api/payment/create-payment-intent/${this.selectedSubmission.id}`, {
    amount: parseFloat(this.donationAmount.toFixed(2))
  }).subscribe({
    next: (response) => {
      console.log('Payment intent response:', response);
      this.clientSecret = response.clientSecret;
      this.initializeStripeElements();
      this.paymentProcessing = false;
    },
    error: (error) => {
      console.error('Error creating payment intent:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Payment Error',
        detail: 'Unable to process payment at this time. Please try again later.'
      });
    }
  });
}

  async submitDonation(): Promise<void> {
    if (!this.selectedSubmission || !this.donationAmount || this.donationAmount <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a valid donation amount'
      });
      return;
    }

    if (!this.clientSecret) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Payment not initialized correctly'
      });
      return;
    }

    this.paymentProcessing = true;

    try {
      const stripe = await this.stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      console.log('Confirming card payment with client secret:', this.clientSecret);
      // Make sure we have a valid email format for Stripe
      const userEmail = this.user?.email || 'anonymous@example.com';
      const validEmail = userEmail.includes('@') && userEmail.includes('.') ? userEmail : 'anonymous@example.com';
      
      console.log('Using email for billing:', validEmail);
      
      const result = await stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: this.user?.username || 'Anonymous',
            email: validEmail
          }
        }
      });

      console.log('Payment confirmation result:', result);
      if (result.error) {
        console.error('Payment error:', result.error);
        this.messageService.add({
          severity: 'error',
          summary: 'Payment Failed',
          detail: result.error.message || 'Payment processing failed. Please try again.'
        });
      } else if (result.paymentIntent?.status === 'succeeded') {
        // Payment successful
        this.donationSuccess = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Thank you! Your donation of $${this.donationAmount} was successful.`
        });
        
        // Reset the form
        setTimeout(() => {
          this.showDonationForm = false;
          this.donationAmount = 0;
          this.clientSecret = null;
          this.showSubmissionDetailsDialog = false;
          // Refresh the submissions to show updated donation amounts
          if (this.hackathon) {
            this.loadTeamSubmissions(this.hackathon.id);
          }
        }, 3000);
      } else {
        console.warn('Unexpected payment status:', result.paymentIntent?.status);
        this.messageService.add({
          severity: 'warn',
          summary: 'Payment Status',
          detail: `Payment status: ${result.paymentIntent?.status || 'unknown'}`
        });
      }
    } catch (e) {
      console.error('Stripe payment error:', e);
      this.messageService.add({
        severity: 'error',
        summary: 'Payment Error',
        detail: 'An unexpected error occurred during payment processing.'
      });
    } finally {
      this.paymentProcessing = false;
    }
  }


  initializeStripeElements(): void {
    setTimeout(() => {
      if (!this.clientSecret) {
        console.error('Cannot initialize Stripe elements without a client secret');
        return;
      }
      
      const stripe = this.stripePromise;
      if (!stripe) {
        console.error('Failed to load Stripe.js');
        return;
      }
      
      stripe.then(stripeInstance => {
        if (!stripeInstance) {
          console.error('Failed to initialize Stripe');
          return;
        }
        
        // Ensure clientSecret is not null before creating elements
        if (!this.clientSecret) {
          console.error('Client secret is null');
          return;
        }
        
        const elements = stripeInstance.elements({
          clientSecret: this.clientSecret as string // Type assertion to handle null check
        });
        
        // Create card element
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
        
        this.cardElement = elements.create('card', { style });
        
        // Wait for the DOM to be ready
        setTimeout(() => {
          const cardElementContainer = document.getElementById('card-element');
          if (cardElementContainer) {
            this.cardElement.mount('#card-element');
            
            // Handle validation errors
            this.cardElement.on('change', (event: any) => {
              const displayError = document.getElementById('card-errors');
              if (displayError) {
                displayError.textContent = event.error ? event.error.message : '';
              }
            });
          } else {
            console.error('Card element container not found');
          }
        }, 100);
      });
    }, 0);
  }

  checkMentorStatus(): void {
    const userId = this.storageService.getLoggedInUserId();
    const hackathonId = this.hackathon?.id;
    
    // Reset mentor status when checking a new hackathon
    this.isAlreadyMentor = false;
    this.existingMentorListing = null;
    
    if (userId && hackathonId) {
      // Get mentors for this hackathon
      this.listMentorService.getListMentorsByHackathonId(hackathonId).subscribe(
        mentorListings => {
          // Check if current user is already a mentor for THIS hackathon
          const userListing = mentorListings.find(
            listing => listing.mentor && listing.mentor.id === userId
          );
          
          if (userListing) {
            this.isAlreadyMentor = true;
            this.existingMentorListing = userListing;
            console.log('Found existing mentor listing:', userListing);
          } else {
            this.isAlreadyMentor = false;
            this.existingMentorListing = null;
            console.log('No existing mentor listing found for this hackathon');
          }
        },
        error => {
          console.error('Error checking mentor status:', error);
          this.isAlreadyMentor = false;
          this.existingMentorListing = null;
        }
      );
    }
  }

  navigateToLanding() {
    this.router.navigate(['/landing']);
  }
  
  getBadgeIcon(): string {
    const badgeIcons: Record<string, string> = {
      JUNIOR_COACH: 'assets/demo/images/avatar/JUNIOR_COACH.png',
      ASSISTANT_COACH: 'assets/demo/images/avatar/ASSISTANT_COACH.png',
      SENIOR_COACH: 'assets/demo/images/avatar/SENIOR_COACH.png',
      HEAD_COACH: 'assets/demo/images/avatar/HEAD_COACH.png',
      MASTER_MENTOR: 'assets/demo/images/avatar/MASTER_MENTOR.png'
    };
    
    // This will work with both badge as string and badge as enum
    return this.user && this.user.badge ? badgeIcons[this.user.badge] || 'assets/icons/default_badge.png' : '';
  }

  JoinLiveStream() {
    if (this.hackathon) {
      this.router.navigate(['/landing-live-stream', this.hackathon.id]);
    }
  }

  addPrize(hackathonId: number | undefined) {
    if (!hackathonId) return;
    this.router.navigate(['/prize-form', hackathonId]);
  }

   // Add a method to get prizes count - filtered by status
   getPrizesCount(hackathonId: number): void {
    this.prizeService.getPrizesByHackathonId(hackathonId).subscribe({
      next: (prizes) => {
        // Filter out canceled and rejected prizes
        const activePrizes = prizes.filter(prize => 
          prize.status !== ApplicationStatus.CANCELED && prize.status !== ApplicationStatus.REJECTED);
        this.prizeCount = activePrizes.length;
      },
      error: (err) => {
        console.error('Error fetching prizes:', err);
        this.prizeCount = 0; // Default to 0 if there's an error
      }
    });
  }

  // Add a method to load prizes - filtered by status
  loadPrizes(hackathonId: number): void {
    this.prizeService.getPrizesByHackathonId(hackathonId).subscribe({
      next: (prizes) => {
        // Filter out canceled and rejected prizes
        this.prizes = prizes.filter(prize => 
          prize.status !== ApplicationStatus.CANCELED && prize.status !== ApplicationStatus.REJECTED);
        this.prizeCount = this.prizes.length;
      },
      error: (err) => {
        console.error('Error fetching prizes:', err);
        this.prizes = [];
        this.prizeCount = 0;
      }
    });
  }

  // Helper method to convert prize category enum to readable text
  getPrizeCategoryName(category: PrizeCategory): string {
    switch(category) {
      case PrizeCategory.BEST_INNOVATION:
        return 'Best Innovation';
      case PrizeCategory.BEST_DESIGN:
        return 'Best Design';
      case PrizeCategory.BEST_AI_PROJECT:
        return 'Best AI Project';
      default:
        // Force TypeScript to treat it as a string
        return String(category).replace('_', ' ');
    }
  }

  applyAsMentor() {
    if (!this.hackathon || !this.user) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'You must be logged in to apply as a mentor'
      });
      return;
    }
  
    // Only pass mentorListingId if there's a valid existing mentor listing for THIS hackathon
    const mentorListingId = this.isAlreadyMentor && this.existingMentorListing ? 
      this.existingMentorListing.id : null;
  
    // Show the dialog
    this.dialogRef = this.dialogService.open(ListMentorFormComponent, {
      header: this.isAlreadyMentor ? 'Update Mentor Application' : 'Apply as Mentor',
      width: '450px',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: {
        hackathonId: this.hackathon.id,
        mentorListingId: mentorListingId
      }
    });

    // Handle the dialog close event
    this.dialogRef.onClose.subscribe((result) => {
      if (result) {
        // Success - refresh mentor status
        this.checkMentorStatus();
        
        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isAlreadyMentor 
            ? 'Your mentor application has been updated!'
            : 'Your mentor application has been submitted!'
        });
      }
    });
  }




  openMentorDetails(mentor: any) {
    const ref = this.dialogService.open(MentorDetailsDialogComponent, {
      data: {
        mentor: mentor.mentor || mentor, // Handle both formats: {mentor: User} or User
        hackathonId: this.hackathon?.id    // Pass the hackathon ID

      },
      header: 'Mentor Details',
      width: '70%',
      contentStyle: { 'max-height': '90vh', 'overflow': 'auto' }
    });

    ref.onClose.subscribe((result) => {
      if (result) {
        this.messageService.add({
          severity: 'success', 
          summary: 'Success', 
          detail: 'Mentor evaluation processed successfully'
        });
        
        // If you need to refresh mentor data after evaluation
        // this.loadMentors(); // Or any other method to refresh data
      }
    });
  }
}