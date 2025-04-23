
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private apiUrl = 'http://localhost:9100/api'; // Adjust based on your backend URL

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    // Listen for messages from the Google OAuth popup
    window.addEventListener('message', this.handleAuthMessage.bind(this), false);
  }


  
  // Check if user has Google Calendar connected
  isGoogleCalendarConnected(): Observable<{ connected: boolean }> {
    const userId = this.storageService.getLoggedInUserId();
    return this.http.get<{ connected: boolean }>(
      `${this.apiUrl}/auth/google/status?userId=${userId}`
    );
  }
  getGoogleAuthUrl(): Observable<{ url: string }> {
    const userId = this.storageService.getLoggedInUserId();
        return this.http.get<{ url: string }>(`${this.apiUrl}/auth/google/url?userId=${userId}`);
    }

  // Add event to Google Calendar
  addEventToCalendar(hackathonId: number, numberOfTeams: number): Observable<any> {
    const userId = this.storageService.getLoggedInUserId();
    return this.http.post(`${this.apiUrl}/auth/google/add-event`, null, {
      params: {
        userId: userId!.toString(),
        hackathonId: hackathonId.toString(),
        numberOfTeams: numberOfTeams.toString()
      }
    });
  }

  // Handle messages from the OAuth popup window
  private handleAuthMessage(event: MessageEvent): void {
    if (event.data === 'google-auth-success') {
      // Refresh the Google Calendar connection status
      this.isGoogleCalendarConnected().subscribe();
      
      // Notify any listeners that authentication was successful
      // You could implement a subject/observable pattern here
      console.log('Google Calendar successfully connected!');
    }
  }
}
