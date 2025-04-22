import { Component } from '@angular/core';

@Component({
  selector: 'app-access-denied',
  template: `
    <div class="access-denied">
      <h2>Access Denied</h2>
      <p>Sorry, you don't have permission to access this page. This page is restricted to administrators only.</p>
      <button pButton type="button" label="Go to Home" routerLink="/"></button>
    </div>
  `,
  styles: [`
    .access-denied {
      text-align: center;
      padding: 3rem;
      max-width: 600px;
      margin: 0 auto;
    }
    h2 {
      color: #e91e63;
      margin-bottom: 1rem;
    }
    p {
      margin-bottom: 2rem;
    }
  `]
})
export class AccessDeniedComponent { }