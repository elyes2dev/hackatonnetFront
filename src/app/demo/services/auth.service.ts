import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';  // Ensure the path to the User model is correct

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9100/auth'; 
  private userRole = 'admin'; // This should be set based on the logged-in user


  constructor(private http: HttpClient) {}

  login(name: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { name, password });
  }

  register(userData: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset_password`, { email });
  }

  storeToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }

  getUserRole(): string {
    return this.userRole;
  }
 // setUserRole(role: string): void {
  //  this.userRole = role;
 // }

}
