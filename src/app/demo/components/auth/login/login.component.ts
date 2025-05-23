import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/demo/services/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { jwtDecode } from 'jwt-decode';
import { StorageService } from 'src/app/demo/services/storage.service';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {

    valCheck: string[] = ['remember'];

  

    name = '';
    password = '';
    token = "";
    error: string | null = null;

  constructor(private authService: AuthService, public layoutService: LayoutService, private router: Router,private storageService : StorageService) {}


  onSignIn(): void {
    console.log('Sign In clicked!');
    console.log('Name:', this.name);
    this.authService.login(this.name, this.password).subscribe({
      next: (response) => {
        if (response.jwtToken) {
          this.token = response.jwtToken;
          this.authService.storeToken(this.token);

          const decodedToken: any = jwtDecode(this.token);
          const userId = decodedToken.userid;
          const roles: string[] = decodedToken.roles || [];

          // Use the service to set the user ID in local storage
          this.storageService.setUserId(userId);

          if (roles.includes('admin')) {
            this.router.navigate(['/']);
          } else {
            this.router.navigate(['/landing']);
          }
        } else {
          console.error('JWT token is not in the response');
        }
      },
      error: (err) => {
        this.error = 'Login failed';
        console.error('Error during login:', err);
      },
    });
  }

  forgetpassword(): void {
    this.router.navigate(['/auth/reset-password']);
  }
  
}