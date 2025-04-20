import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

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

    constructor(
      private storageService: StorageService,
      public layoutService: LayoutService,
      public router: Router,
      private authService: AuthService ,
      private userService: UserService// Inject AuthService
    ) {
      this.userId = this.storageService.getUserId();
      this.isAuthenticated = this.authService.isAuthenticated(); // Use AuthService to determine authentication state
      console.log('User ID:', this.userId);
    }

    ngOnInit(): void {
        this.getUserRole();
      }

    logout()
    {
        this.authService.logout()
        window.location.reload();
    }

      // Fetch and log user role
      getUserRole() {
        const userId = localStorage.getItem('loggedid'); // Assuming user ID is stored in localStorage
        console.log('UserID from localStorage:', userId);
        if (userId) {
          this.userService.getUserById(parseInt(userId)).subscribe({
            next: (user: User) => {
              if (user.roles && user.roles.length > 0) {
                console.log('User roles:', user.roles.map(role => role.name)); // Log roles

                // Check if user has an admin role
                this.isAdmin = user.roles.some(role => role.name === 'admin');
                // Check if user has a student role
                this.isStudent = user.roles.some(role => role.name === 'student');

                console.log('Is Admin:', this.isAdmin);  // Log isAdmin after setting
                console.log('Is Student:', this.isStudent);  // Log isStudent after setting
              } else {
                console.log('No roles found for the user');
              }
            },
            error: (err) => console.error('Error fetching user roles:', err)
          });
        } else {
          console.error('User ID not found in localStorage');
        }
      }






}
