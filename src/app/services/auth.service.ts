import { Injectable } from '@angular/core';
import { AuthControllerService } from '../services/auth-controller.service'; // Adjust path
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Login$Params } from '../fn/auth-controller/login';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'authToken';

  constructor(private authControllerService: AuthControllerService) {}

  login(username: string, password: string): Observable<string> {
    const params: Login$Params = {
      body: { username, password }
    };
    return this.authControllerService.login(params).pipe(
      tap(token => {
        if (token) {
          localStorage.setItem(this.tokenKey, token);
          console.log('Stored token:', token);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error(error.error?.message || 'Authentication failed'));
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    console.log('Manually set token:', token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded: any = jwtDecode(token);
      const now = Date.now() / 1000;
      return decoded.exp > now;
    } catch {
      return false;
    }
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.userId || 9; // Fallback to 5 for "gg"
    } catch {
      return null;
    }
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.sub || null; // "gg"
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}