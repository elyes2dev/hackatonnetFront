import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable(
  {
    providedIn: 'root'
  }
)
export class SocialService {
  private apiUrl = 'http://localhost:9100/auth'; 
  private userRole = 'admin';

  constructor(private http: HttpClient,private authservice: AuthService) {}


  loginWithGoogle(idToken: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(
        `${this.apiUrl}/social-login`, 
        { idToken }
      )
      .pipe(
        tap(resp => this.authservice.storeToken(resp.token))
      );
  }
}