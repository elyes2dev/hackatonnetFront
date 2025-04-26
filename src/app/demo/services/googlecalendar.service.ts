import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private baseUrl = 'http://localhost:9100/api/mentor-calendar';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  isGoogleCalendarConnected(): Observable<{ connected: boolean }> {
    const userId = this.storageService.getLoggedInUserId();
    if (!userId) {
      return of({ connected: false });
    }
    return this.http.get<{ connected: boolean }>(`${this.baseUrl}/status?userId=${userId}`).pipe(
      catchError(() => of({ connected: false }))
    );
  }

  getGoogleAuthUrl(): Observable<{ url: string }> {
    const userId = this.storageService.getLoggedInUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }
    return this.http.get<{ url: string }>(`${this.baseUrl}/auth-url?userId=${userId}`);
  }

  getMentorListingCalendarStatus(listMentorId: number): Observable<{ connected: boolean }> {
    const userId = this.storageService.getLoggedInUserId();
    if (!userId) {
      return of({ connected: false });
    }
    return this.http.get<{ connected: boolean }>(`${this.baseUrl}/status/${listMentorId}?userId=${userId}`).pipe(
      catchError(() => of({ connected: false }))
    );
  }

  addEventToCalendar(hackathonId: number, numberOfTeams: number): Observable<any> {
    const userId = this.storageService.getLoggedInUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }
    return this.http.post<any>(`${this.baseUrl}/sync`, { 
      userId, 
      hackathonId, 
      numberOfTeams 
    });
  }
}