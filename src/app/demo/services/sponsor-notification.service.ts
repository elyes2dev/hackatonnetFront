import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SponsorNotification } from '../models/sponsor-notification';

@Injectable({
  providedIn: 'root'
})
export class SponsorNotificationService {

  private baseUrl = 'http://localhost:9100/notifications';
  private unreadNotificationsSubject = new BehaviorSubject<SponsorNotification[]>([]);
  unreadNotifications$ = this.unreadNotificationsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUnreadNotifications();
  }

  loadUnreadNotifications(): void {
    this.getUnreadNotifications().subscribe(notifications => {
      this.unreadNotificationsSubject.next(notifications);
    });
  }

  getUnreadNotifications(): Observable<SponsorNotification[]> {
    return this.http.get<SponsorNotification[]>(`${this.baseUrl}/unread`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/mark-as-read/${id}`, {})
      .pipe(
        tap(() => {
          // Update local state after marking as read
          const currentNotifications = this.unreadNotificationsSubject.value;
          const updatedNotifications = currentNotifications.filter(n => n.id !== id);
          this.unreadNotificationsSubject.next(updatedNotifications);
        })
      );
  }
}
