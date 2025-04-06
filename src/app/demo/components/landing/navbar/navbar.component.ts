import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(public router: Router, public layoutService: LayoutService) {}

  navigateToLanding() {
    this.router.navigate(['/landing']);  // Redirect to '/landings'
  }
}
