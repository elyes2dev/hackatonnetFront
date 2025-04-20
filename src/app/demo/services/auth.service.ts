import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { SocialAuthService, GoogleLoginProvider, SocialUser } from '@abacritt/angularx-social-login';
import { User } from '../models/user.model';

@Injectable(

)
export class AuthService {
  private apiUrl = 'http://localhost:9100/auth'; 
  private userRole: string = 'admin'; // This should be set based on the logged-in user

  constructor(private http: HttpClient, private socialAuthService: SocialAuthService) {}

  // Google Login method
  loginWithGoogle(idToken: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(
        `${this.apiUrl}/social-login`, 
        { idToken }
      )
      .pipe(
        tap(resp => this.storeToken(resp.token))
      );
  }

  // Authenticate with the backend using Google token
  private authenticateWithBackend(googleToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/social-login`, { token: googleToken });
  }

  // Login with username and password (traditional login)
  login(name: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { name, password });
  }

  // Register a new user
  register(userData: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  // Reset password
  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset_password`, { email });
  }

  // Store the JWT token in local storage
  storeToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Get the stored JWT token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Check if the user is authenticated (if token exists)
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Log out the user by removing the token
  logout(): void {
    localStorage.removeItem('authToken');
  }

  // Get the user's role
  getUserRole(): string {
    return this.userRole;
  }
}
