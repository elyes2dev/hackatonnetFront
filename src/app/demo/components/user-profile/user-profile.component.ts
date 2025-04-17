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

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    const userId = this.storageService.getLoggedInUserId();
    this.userService.getUserById(userId).subscribe(user => {
      // Fix: keep null if birthdate is null
      if (user && user.birthdate === null) {
        user.birthdate = null;
      }
      this.user = user;
    });
  }

  /**
   * Returns a display-safe value for lists (like skills)
   */
  safeArray<T>(arr: T[] | null | undefined): T[] {
    return Array.isArray(arr) ? arr : [];
  }

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
}
