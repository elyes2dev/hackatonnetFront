import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { LayoutService } from '../../../../layout/service/app.layout.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registrationData = {
    name: '',
    lastname: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    birthdate: null,
    picture: '',
    description: '',
    badge: 'ROLE_USER'
  };

  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    public layoutService: LayoutService
  ) {}

  registerUser() {
    const { password, confirmPassword } = this.registrationData;

    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.authService.register(this.registrationData).subscribe({
      next: (response) => {
        this.authService.storeToken(response.token);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Registration failed. Please try again.';
      }
    });
  }
}
