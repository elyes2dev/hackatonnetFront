import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  token!: string;
  isLoading = false;
  errorMessage: string = '';
  successMessage: string = '';
  passwordsMatching = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Extract token from URL query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.errorMessage = 'Invalid password reset link. Please request a new one.';
      }
    });

    // Initialize form
    this.resetForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  checkPasswordsMatch(): void {
    const password = this.resetForm.get('password')?.value ?? '';
    const confirmPassword = this.resetForm.get('confirmPassword')?.value ?? '';
    this.passwordsMatching = password === confirmPassword;
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.passwordsMatching) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";
    
    const newPassword = this.resetForm.get('password')?.value ?? '';
    
    this.authService.resetPassword(this.token)
      .subscribe(
        (response: any) => {
          this.isLoading = false;
          this.successMessage = 'Your password has been successfully reset.';
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        (error: { error?: { message?: string } }) => {
          this.isLoading = false;
          this.errorMessage = error?.error?.message || 'Failed to reset password. Please try again.';
        }
      );
  }

  get password() {
    return this.resetForm.get('password')!;
  }
  
  get confirmPassword() {
    return this.resetForm.get('confirmPassword')!;
  }
  
}