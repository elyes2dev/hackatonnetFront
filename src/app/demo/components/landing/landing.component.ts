import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { OnInit } from '@angular/core';
import { Workshop } from '../../models/workshop.model';
import { WorkshopService } from '../../services/workshop.service';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  userId: string | null = null;
  isAuthenticated = false;
  isAdmin = false;
  isStudent = false; 
  isSponsor = false; // Added sponsor flag
  user!: User;
  isMentor = false; 

  userMenuVisible = false; // Property to control dropdown visibility
  workshops: Workshop[] = [];
  loadingWorkshops = false;


  constructor(
    private storageService: StorageService,
    public layoutService: LayoutService,
    public router: Router,
    private authService: AuthService,
    private userService: UserService,
    private workshopService: WorkshopService
  ) {
    this.userId = this.storageService.getUserId();
    this.isAuthenticated = this.authService.isAuthenticated();
    console.log('User ID:', this.userId);
  }

  username = '';
  applicationsMenuVisible = false;


  ngOnInit(): void {
    this.userMenuVisible = false;
    this.applicationsMenuVisible = false;
    const userId = this.storageService.getLoggedInUserId();
    console.log('User ID from storage:', this.authService.isAuthenticated());
    this.getUserRole;
    if (userId) {
      this.userService.getUserById(userId).subscribe((data) => {
        this.user = data;
        this.username = data.name;
        // Check if user has SPONSOR role
        this.isSponsor = this.user.roles?.some(role => role.name === 'SPONSOR') || false;
        this.isMentor = this.user.roles?.some(role => role.name === 'MENTOR') || false;

      });
    }
    this.loadWorkshops();
  } 




  // Fetch and log user role
  getUserRole() {
      const userId = this.storageService.getLoggedInUserId(); // Use the same method as in navbar
      console.log('UserID from localStorage:', userId);
      if (userId) {
        this.userService.getUserById(userId).subscribe({
          next: (user: User) => {
            if (user.roles && user.roles.length > 0) {
              console.log('User roles:', user.roles.map(role => role.name));

              // Check for roles
              this.isAdmin = user.roles.some(role => role.name === 'admin');
              this.isStudent = user.roles.some(role => role.name === 'student');
              this.isSponsor = user.roles.some(role => role.name === 'SPONSOR'); // Same check as in navbar

              console.log('Is Admin:', this.isAdmin);
              console.log('Is Student:', this.isStudent);
              console.log('Is Sponsor:', this.isSponsor);
            } else {
              console.log('No roles found for the user');
            }
          },
          error: (err) => console.error('Error fetching user roles:', err)
        });
      } else {
        console.log('User not logged in');
      }
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
  
     // Method to toggle applications dropdown
toggleApplicationsMenu(event: Event) {
  event.stopPropagation();
  this.applicationsMenuVisible = !this.applicationsMenuVisible;
  
  // Close user menu if open
  if (this.applicationsMenuVisible && this.userMenuVisible) {
    this.userMenuVisible = false;
  }
}

  loadWorkshops(): void {
    this.loadingWorkshops = true;
    this.workshopService.getAllWorkshops().subscribe({
      next: (workshops) => {
        this.workshops = workshops.slice(0, 3); // Get only first 3 workshops
        this.loadingWorkshops = false;
      },
      error: (error) => {
        console.error('Error loading workshops:', error);
        this.loadingWorkshops = false;
      }
    });
  }

  navigateToWorkshop(workshopId: number): void {
    this.router.navigate(['/workshopsf', workshopId, 'resources']);
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
}

