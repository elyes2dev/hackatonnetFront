import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { User } from '../../models/user.model'; // ✅ Correct import

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  profileImageUrl: string | null = null;
  isLoading: boolean = true;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  /**
   * Loads the user profile data
   */
  loadUserProfile(): void {
    this.isLoading = true;
    const userId = this.storageService.getLoggedInUserId();
    
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        // Fix: keep null if birthdate is null
        if (user && user.birthdate === null) {
          user.birthdate = null;
        }
        this.user = user;
        
        // Load profile image if user has one
        if (user && user.picture) {
          this.profileImageUrl = user.picture;
        } else {
          this.profileImageUrl = null;
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Returns a display-safe value for lists (like skills)
   */


  /**
   * Returns a label for the badge string
   */
  getBadgeLabel(badge?: string): string {
    if (!badge) return '';
    switch (badge.toLowerCase()) {
      case 'junior_coach': return 'Junior Coach';
      case 'assistant_coach': return 'Assistant Coach';
      case 'senior_coach': return 'Senior Coach';
      case 'head_coach': return 'Head Coach';
      case 'master_mentor': return 'Master Mentor';
      default: return badge; // fallback to raw string
    }
  }

  /**
   * Generates user initials from first and last name
   * Used for the default avatar when no profile image is available
   */
  getInitials(firstName?: string, lastName?: string): string {
    let initials = '';
    
    if (firstName) {
      initials += firstName.charAt(0).toUpperCase();
    }
    
    if (lastName) {
      initials += lastName.charAt(0).toUpperCase();
    }
    
    // If we couldn't generate initials, use a fallback
    return initials || 'U';
  }

  /**
   * Handler for edit profile button
   */
  onEditProfile(): void {
    // Logic to handle profile editing
    console.log('Edit Profile clicked!');
    
    // You could navigate to an edit page or open a modal
    // Example: this.router.navigate(['/edit-profile']);
  }

  safeArray<T>(arr?: T[]): T[] {
    return Array.isArray(arr) ? arr : [];
  }
  
}
