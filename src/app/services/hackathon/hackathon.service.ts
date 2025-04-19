import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Hackathon } from '../../models/hackathon';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class HackathonService {
  // Updated timestamp: 2025-04-15 17:14:25
  // Current user: Zoghlamirim
  private apiUrl = 'http://localhost:9100/pi/api/hackathons'; // Fixed URL

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  getHackathons(): Observable<Hackathon[]> {
    return this.http.get<Hackathon[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error fetching hackathons:', error);
          return throwError(() => new Error('Failed to fetch hackathons'));
        })
      );
  }

  getHackathonById(id: number): Observable<Hackathon> {
    return this.http.get<Hackathon>(`${this.apiUrl}/get-hackathon/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error fetching hackathon:', error);
          return throwError(() => new Error('Failed to fetch hackathon'));
        })
      );
  }
}