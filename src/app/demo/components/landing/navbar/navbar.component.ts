import { Component, OnInit, HostListener } from '@angular/core';
import { Route, Router } from '@angular/router';
import { User } from 'src/app/demo/models/user.model';
import { AuthService } from 'src/app/demo/services/auth.service';
import { StorageService } from 'src/app/demo/services/storage.service';
import { UserService } from 'src/app/demo/services/user.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user!: User;
  isSponsor: boolean = false;
  userId: string | null = null;
  isAuthenticated: boolean = this.authService.isAuthenticated();
  isAdmin: boolean = false;
  isStudent: boolean = false;
  userMenuVisible: boolean = false; // Property to control dropdown visibility
  

  constructor(
    public router: Router, 
    public layoutService: LayoutService, 
    private userService: UserService,
    private storageService: StorageService,
    private authService: AuthService,
    
      
  ) {}

  username: string = '';

  ngOnInit(): void {
    const userId = this.storageService.getLoggedInUserId();
    console.log('User ID from storage:', this.authService.isAuthenticated());
    
    if (userId) {
      this.userService.getUserById(userId).subscribe((data) => {
        this.user = data;
        this.username = data.name;
        // Check if user has SPONSOR role
        this.isSponsor = this.user.roles?.some(role => role.name === 'SPONSOR') || false;
      });
    }
  }

  navigateToLanding() {
    this.router.navigate(['/landing']);
  }
  
  getBadgeIcon(): string {
    const badgeIcons: { [key: string]: string } = {
      JUNIOR_COACH: 'assets/demo/images/avatar/JUNIOR_COACH.png',
      ASSISTANT_COACH: 'assets/demo/images/avatar/ASSISTANT_COACH.png',
      SENIOR_COACH: 'assets/demo/images/avatar/SENIOR_COACH.png',
      HEAD_COACH: 'assets/demo/images/avatar/HEAD_COACH.png',
      MASTER_MENTOR: 'assets/demo/images/avatar/MASTER_MENTOR.png'
    };
    return this.user ? badgeIcons[this.user.badge] || 'assets/icons/default_badge.png' : '';
  }

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
