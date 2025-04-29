import { Component, HostListener, OnInit } from '@angular/core';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { UserService } from 'src/app/demo/services/user.service';
import { User } from 'src/app/demo/models/user.model';
import {NavbarComponent} from "../../navbar/navbar.component";
import { StorageService } from 'src/app/demo/services/storage.service';
import { AuthService } from 'src/app/demo/services/auth.service';
import { HackathonWithCategories, CategoryType } from 'src/app/demo/models/hackathon-category';
import { CategorizationService } from 'src/app/demo/services/categorization/categorization.service';

@Component({
  selector: 'app-landing-hackathon-list',
  templateUrl: './landing-hackathon-list.component.html',
  styleUrls: ['./landing-hackathon-list.component.scss']
})
export class LandingHackathonListComponent implements OnInit {
  hackathons: HackathonWithCategories[] = [];
  filteredHackathons: HackathonWithCategories[] = [];
  searchTerm = '';
  selectedEventType: string | null = null;

  user!: User;
  isSponsor = false;
  isMentor = false; 


  userId: string | null = null;
  isAuthenticated: boolean = this.authService.isAuthenticated();
  isAdmin = false;
  isStudent = false;
  userMenuVisible = false; // Property to control dropdown visibility
  


  eventTypeOptions = [
    { label: 'Online', value: 'online' },
    { label: 'Onsite', value: 'onsite' }
  ];

  // New properties for category filtering
  themeOptions: any[] = [];
  audienceOptions: any[] = [];
  techOptions: any[] = [];
  selectedTheme: string | null = null;
  selectedAudience: string | null = null;
  selectedTech: string | null = null;

  constructor(
    private hackathonService: HackathonService, 
    public router: Router, 
    public layoutService:LayoutService, 
    private userService: UserService,
        private storageService: StorageService,
        private authService: AuthService,
        private categorizationService: CategorizationService
    ) {}


    
  username = '';
  applicationsMenuVisible = false;


  ngOnInit() {
    this.loadHackathons();
    this.initializeCategoryOptions();
    this.userService.getUserById(1).subscribe((data) => {
      this.user = data;
    });

    this.userMenuVisible = false;
    this.applicationsMenuVisible = false;
    const userId = this.storageService.getLoggedInUserId();
    console.log('User ID from storage:', this.authService.isAuthenticated());
    
    if (userId) {
      this.userService.getUserById(userId).subscribe((data) => {
        this.user = data;
        this.username = data.name;
        // Check if user has SPONSOR role
        this.isSponsor = this.user.roles?.some(role => role.name === 'SPONSOR') || false;
        this.isMentor = this.user.roles?.some(role => role.name === 'MENTOR') || false;

      });
    }
  }

  initializeCategoryOptions() {
    // Create dropdown options for categories
    this.themeOptions = this.categorizationService.getAllCategories(CategoryType.THEME)
      .map(theme => ({ label: this.capitalizeFirstLetter(theme), value: theme }));
    
    this.audienceOptions = this.categorizationService.getAllCategories(CategoryType.AUDIENCE)
      .map(audience => ({ label: this.capitalizeFirstLetter(audience), value: audience }));
    
    this.techOptions = this.categorizationService.getAllCategories(CategoryType.TECH)
      .map(tech => ({ label: this.capitalizeFirstLetter(tech), value: tech }));
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  filterHackathons() {
    this.filteredHackathons = this.hackathons.filter(hackathon => {
      const matchesSearch = hackathon.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.selectedEventType || 
                         (this.selectedEventType === 'online' && hackathon.isOnline) || 
                         (this.selectedEventType === 'onsite' && !hackathon.isOnline);
      
      const matchesTheme = !this.selectedTheme || 
                          (hackathon.categories?.theme?.includes(this.selectedTheme));
      
      const matchesAudience = !this.selectedAudience || 
                             (hackathon.categories?.audience?.includes(this.selectedAudience));
      
      const matchesTech = !this.selectedTech || 
                         (hackathon.categories?.tech?.includes(this.selectedTech));
      
      return matchesSearch && matchesType && matchesTheme && matchesAudience && matchesTech;
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedEventType = null;
    this.selectedTheme = null;
    this.selectedAudience = null;
    this.selectedTech = null;
    this.filteredHackathons = [...this.hackathons];
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
    }
  }
  
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

  loadHackathons() {
    this.hackathonService.getHackathons().subscribe((data: Hackathon[]) => {
      // Apply categorization to each hackathon
      this.hackathons = data.map(hackathon => 
        this.categorizationService.categorizeHackathon(hackathon)
      );
      this.filteredHackathons = [...this.hackathons];
    });
  }

  getDaysUntilStart(startDate: string): string {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Event ended';
    } else if (diffDays === 0) {
      return 'Starts today!';
    } else if (diffDays === 1) {
      return 'Starts tomorrow';
    } else {
      return `${diffDays} days to start`;
    }
  }

}
