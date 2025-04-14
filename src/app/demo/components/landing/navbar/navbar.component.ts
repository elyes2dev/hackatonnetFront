import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  constructor(public layoutService: LayoutService, public router: Router) {}

  navigateToTeamSubmission(): void {
    this.router.navigate(['/team-submission']); // Navigation directe vers /team-submission
  }
}