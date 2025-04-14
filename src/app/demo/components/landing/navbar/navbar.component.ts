import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(public router: Router, public layoutService: LayoutService) {}

  navigateToLanding() {
    this.router.navigate(['/landing']);  // Redirect to '/landings'
  }
}
// src/app/demo/components/landing/navbar/navbar.component.ts
