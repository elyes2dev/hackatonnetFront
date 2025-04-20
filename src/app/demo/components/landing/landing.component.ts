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
    styles: [`
        #hero{
            background: linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, #EEEFAF 0%, #C3E3FA 100%);
            height:700px;
            overflow:hidden;
        }

        .pricing-card:hover{
            border:2px solid var(--cyan-200) !important;
        }

        @media screen and (min-width: 768px) {
            #hero{
                -webkit-clip-path: ellipse(150% 87% at 93% 13%);
                clip-path: ellipse(150% 87% at 93% 13%);
                height: 530px;
            }
        }

        @media screen and (min-width: 1300px){
            #hero > img {
                position: absolute;
                transform:scale(1.2);
                top:15%;
            }

        #hero > div > p {
                max-width: 450px;
            }
        }

        @media screen and (max-width: 1300px){
            #hero {
                height: 600px;
            }

        #hero > img {
            position:static;
            transform: scale(1);
            margin-left: auto;
        }

        #hero > div {
            width: 100%;
        }

        #hero > div > p {
                width: 100%;
                max-width: 100%;
            }
        }
    `]
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