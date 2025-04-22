import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { OnInit } from '@angular/core';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  userId: string | null = null;
  isAuthenticated: boolean = false;
  isAdmin: boolean = false;
  isStudent: boolean = false;
  isSponsor: boolean = false; // Added sponsor flag

  constructor(
    private storageService: StorageService,
    public layoutService: LayoutService,
    public router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.userId = this.storageService.getUserId();
    this.isAuthenticated = this.authService.isAuthenticated();
    console.log('User ID:', this.userId);
  }

  ngOnInit(): void {
      this.getUserRole();
  }

  logout() {
      this.authService.logout()
      window.location.reload();
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
}
