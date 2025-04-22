import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { User } from 'src/app/demo/models/user.model';
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

  constructor(
    public router: Router,
    public layoutService: LayoutService,
    private userService: UserService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    const userId = this.storageService.getLoggedInUserId();

    if (userId) {
      this.userService.getUserById(userId).subscribe((data) => {
        this.user = data;
        // Check if user has SPONSOR role
        this.isSponsor = this.user.roles?.some(role => role.name === 'SPONSOR') || false;
      });
    }
  }

  navigateToLanding() {
    this.router.navigate(['/landing']);
  }

    navigateToTeamSubmission(): void {
        this.router.navigate(['/team-submission']); // Navigation directe vers /team-submission
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
}
