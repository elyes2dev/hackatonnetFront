import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { StorageService } from 'src/app/demo/services/storage.service';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(private storageService: StorageService, private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    
    // Check if user is logged in
    const userId = this.storageService.getLoggedInUserId();
    console.log('AdminGuard - Checking user ID:', userId);
    
    if (!userId) {
      // Not logged in, redirect to login
      console.log('AdminGuard - No user ID found, redirecting to login');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return of(false);
    }
    
    // Check if user is admin using dynamic method
    return this.storageService.checkUserIsAdmin().pipe(
      tap(isAdmin => console.log('AdminGuard - Is user admin:', isAdmin)),
      map(isAdmin => {
        if (!isAdmin) {
          // Logged in but not admin, redirect to access denied
          console.log('AdminGuard - User is not admin, redirecting to access denied');
          this.router.navigate(['/access-denied']);
          return false;
        }
        
        // Admin user, allow access
        console.log('AdminGuard - Access granted to admin user');
        return true;
      }),
      catchError(error => {
        console.error('Error in admin check:', error);
        this.router.navigate(['/access-denied']);
        return of(false);
      })
    );
  }
}