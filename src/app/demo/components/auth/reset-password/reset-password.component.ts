import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  email = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.resetPassword(this.email).subscribe(
      response => {
        console.log('Reset password link sent', response);
      },
      error => {
        console.error('Error resetting password', error);
      }
    );
  }
}