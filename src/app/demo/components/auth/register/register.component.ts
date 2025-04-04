// Ensure correct imports
import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { LayoutService } from '../../../../layout/service/app.layout.service';

interface RegistrationData {
  [key: string]: string | Date | null;
  name: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  birthdate: Date | null;
  picture: string;
  description: string;
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
    birthdate: null,
    picture: '',
    description: ''
  };

  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router, public layoutService: LayoutService) {}

  registerUser() {
    const { name, lastname, email, username, password } = this.registrationData;

    if (name && lastname && email && username && password) {
      this.authService.register(this.registrationData).subscribe({
        next: response => {
          this.authService.storeToken(response.token);
          this.router.navigate(['/dashboard']);
        },
        error: err => {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      });
    } else {
      this.errorMessage = 'Please provide all the required fields.';
    }
  }
}