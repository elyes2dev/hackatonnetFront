import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/demo/services/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
        :host ::ng-deep .p-password input {
            width: 100%;
            padding:1rem;
        }

        :host ::ng-deep .pi-eye{
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }

        :host ::ng-deep .pi-eye-slash{
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class LoginComponent {

    valCheck: string[] = ['remember'];

  //  password!: string;

    name: string = '';
    password: string = '';
    token: string = "";
    error: string | null = null;

  constructor(private authService: AuthService, public layoutService: LayoutService, private router: Router) {}

 onSignIn(): void {
  this.authService.login(this.name, this.password).subscribe({
    next: (response) => {
      if (response.jwtToken) {
        this.token = response.jwtToken; 
        this.authService.storeToken(this.token); 
        console.log('Token received:', this.token);
        
        const userId = response.userId; // Now, userId should be available if sent from backend
        console.log('User ID:', userId);

        this.router.navigate(['/mydashboard', { id: userId }]);
      } else {
        console.error('JWT token is not in the response');
      }
    },
    error: (err) => {
      this.error = 'Login failed';
      console.error('Error during login:', err);
    }
  });
}


    // Mock sign-in method
//    onSignIn() {
        // Perform your sign-in logic here

        // Example sign-in success
  //      const isSignInSuccessful = true;  // Replace this logic with real authentication

    //    if (isSignInSuccessful) {
            // Navigate to the 'mydashboard' route upon successful sign-in
      //      this.router.navigate(['/mydashboard']);
       // }
   // }
}
