import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from 'src/app/demo/services/auth.service'; // Update path if needed

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    
    if (!this.authService.isAuthenticated()) {
      // Not logged in, redirect to login
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    } 
    else if (this.authService.getUserRole() !== 'admin') {
      // Logged in but not admin, redirect to access denied
      this.router.navigate(['/access-denied']);
      return false;
    }
    
    // Admin user, allow access
    return true;
  }
}