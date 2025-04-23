import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TeamDiscussion, MessageType as TeamDiscussionMessageType } from '../models/team-discussion';
import { StorageService } from './storage.service';

export interface ChatMessageDTO {
  id?: number;
  type?: ChatMessageType;
  message: string;
  teamMemberId: number;
  userId?: number;
  senderName?: string;
  createdAt?: string;
  isRead?: boolean;
  messageType?: TeamDiscussionType;
}

export enum ChatMessageType {
  CHAT = 'CHAT',
  JOIN = 'JOIN',
  LEAVE = 'LEAVE',
  ERROR = 'ERROR'
}

export enum TeamDiscussionType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  EMOJI = 'EMOJI'
}

@Injectable({
  providedIn: 'root'
})
export class TeamDiscussionService {
  private apiUrl = 'http://localhost:9100/api/team-discussions';
  
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  // Get team discussions by team ID
  getTeamDiscussions(teamId: number): Observable<TeamDiscussion[]> {
    return this.http.get<TeamDiscussion[]>(`${this.apiUrl}/team/${teamId}`).pipe(
      tap(discussions => console.log('Fetched team discussions:', discussions)),
      catchError(this.handleError)
    );
  }

  private convertToDtoMessageType(entityType: TeamDiscussionMessageType): TeamDiscussionType {
    switch (entityType) {
      case TeamDiscussionMessageType.TEXT:
        return TeamDiscussionType.TEXT;
      case TeamDiscussionMessageType.IMAGE:
        return TeamDiscussionType.IMAGE;
      case TeamDiscussionMessageType.FILE:
        return TeamDiscussionType.FILE;
      case TeamDiscussionMessageType.EMOJI:
        return TeamDiscussionType.EMOJI;
      default:
        throw new Error(`Unsupported message type: ${entityType}`);
    }
  }

  // Send a message in a team chat
  sendMessage(teamId: number, teamMemberId: number, message: string, messageType: TeamDiscussionMessageType = TeamDiscussionMessageType.TEXT): Observable<ChatMessageDTO> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const payload = { message };
    
    return this.http.post<ChatMessageDTO>(
      `${this.apiUrl}/send/${teamId}?teamMemberId=${teamMemberId}&messageType=${messageType}`, 
      payload, 
      { headers }
    ).pipe(
      tap(response => console.log('Sent message:', response)),
      catchError(this.handleError)
    );
  }

  // Get chat info (current date time and user)
  getChatInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/info`).pipe(
      tap(info => console.log('Chat info:', info)),
      catchError(this.handleError)
    );
  }

  // Get participants in a team chat
  getParticipants(teamId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/participants/${teamId}`).pipe(
      tap(participants => console.log('Chat participants:', participants)),
      catchError(this.handleError)
    );
  }

  // Mark a message as read
  markAsRead(discussionId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${discussionId}/read`, {}).pipe(
      tap(response => console.log('Marked message as read:', response)),
      catchError(this.handleError)
    );
  }

  // Delete a discussion
  deleteDiscussion(discussionId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${discussionId}`).pipe(
      tap(response => console.log('Deleted discussion:', response)),
      catchError(this.handleError)
    );
  }

  // Get unread message count
  getUnreadCount(teamId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/unread/count/${teamId}`).pipe(
      tap(count => console.log('Unread count:', count)),
      catchError(this.handleError)
    );
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      // Log detailed error information for debugging
      console.error('Error status:', error.status);
      console.error('Error body:', error.error);
      console.error('Full error:', error);
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
