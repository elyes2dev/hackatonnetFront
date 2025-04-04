import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/demo/services/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { jwtDecode } from 'jwt-decode';


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
          
  
          
          const decodedToken: any = jwtDecode(this.token);
          const userId = decodedToken.userid;
          localStorage.setItem('loggedid', userId);
  
  
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

  forgetpassword(): void {
    this.router.navigate(['/forgetpassword']);
  }
  
}

