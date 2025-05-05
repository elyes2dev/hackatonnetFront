import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TeamMember } from '../models/team-members';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class TeamMemberService {
  private apiUrl = 'http://localhost:9100/api/team-members';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  getAllTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(this.apiUrl).pipe(
      tap(members => console.log('Fetched all team members:', members)),
      catchError(this.handleError)
    );
  }

  getTeamMemberById(id: number): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${this.apiUrl}/${id}`).pipe(
      tap(member => console.log(`Fetched team member with id=${id}:`, member)),
      catchError(this.handleError)
    );
  }

  getTeamMembersByTeamId(teamId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/team/${teamId}`).pipe(
      tap(members => console.log(`Fetched team members for team id=${teamId}:`, members)),
      catchError(this.handleError)
    );
  }
  
  // Get current user's team members
  getCurrentUserTeamMembers(): Observable<TeamMember[]> {
    const userId = this.storageService.getLoggedInUserId();
    if (!userId) {
      return throwError(() => new Error('User not logged in'));
    }
    
    // Endpoint to get team members for the user's team
    return this.http.get<TeamMember[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(members => console.log(`Fetched team members for current user id=${userId}:`, members)),
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
