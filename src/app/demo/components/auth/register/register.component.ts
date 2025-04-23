import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { LayoutService } from '../../../../layout/service/app.layout.service';

interface RegistrationData {
  name: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  birthdate: Date | null;
  picture: string;
  description: string;
  badge: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registrationData: RegistrationData = {
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
    const { name, lastname, email, username, password, confirmPassword } = this.registrationData;

    if (!name || !lastname || !email || !username || !password || !confirmPassword) {
      this.errorMessage = 'Please provide all the required fields.';
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.authService.register(this.registrationData).subscribe({
      next: response => {
        this.authService.storeToken(response.token);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Registration failed. Please try again.';
      }
    });
  }
}
