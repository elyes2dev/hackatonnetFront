// src/app/demo/components/landing/auth/login/login.component.ts
import { Component } from '@angular/core';
import { AuthControllerService } from 'src/app/services';
import { Router } from '@angular/router';
import { User } from 'src/app/models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  user: User = { username: '', password: '' };
  errorMessage: string = '';

  constructor(
    private authService: AuthControllerService,
    private router: Router
  ) {}

  login() {
    this.authService.login({ body: this.user }).subscribe({
      next: (token: string) => {
        localStorage.setItem('jwtToken', token);
        const decodedToken = this.decodeToken(token);
        const userId = decodedToken?.id || 1;
        localStorage.setItem('loggedid', userId.toString()); // Store user ID
        this.router.navigate(['/landing']);
      },
      error: (err) => {
        this.errorMessage = 'Login failed. Please check your credentials.';
        console.error(err);
      }
    });
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error('Token decode failed', e);
      return null;
    }
  }
}