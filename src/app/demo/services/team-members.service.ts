import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TeamMember } from '../models/team-members';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TeamMembersService {
  private apiUrl = 'http://localhost:9100/api/team-members';
  
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  // Get all team members
  getAllTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/all`).pipe(
      tap(members => console.log('Fetched team members:', members)),
      catchError(this.handleError)
    );
  }

  // Get team member by ID
  getTeamMemberById(id: number): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${this.apiUrl}/${id}`).pipe(
      tap(member => console.log('Fetched team member:', member)),
      catchError(this.handleError)
    );
  }

  // Add a team member
  addTeamMember(teamMember: TeamMember): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.apiUrl}/add`, teamMember).pipe(
      tap(member => console.log('Added team member:', member)),
      catchError(this.handleError)
    );
  }

  // Get team members by team ID
  getTeamMembersByTeamId(teamId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/team/${teamId}`).pipe(
      tap(members => console.log('Fetched team members for team:', members)),
      catchError(this.handleError)
    );
  }

  // Update a team member
  updateTeamMember(teamMember: TeamMember): Observable<TeamMember> {
    return this.http.put<TeamMember>(`${this.apiUrl}/update/${teamMember.id}`, teamMember).pipe(
      tap(member => console.log('Updated team member:', member)),
      catchError(this.handleError)
    );
  }

  // Delete a team member
  deleteTeamMember(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`).pipe(
      tap(response => console.log('Deleted team member:', response)),
      catchError(this.handleError)
    );
  }

  // Get current user's team memberships
  getCurrentUserTeamMemberships(): Observable<TeamMember[]> {
    const userId = this.storageService.getLoggedInUserId();
    if (!userId) {
      return throwError(() => new Error('User not logged in'));
    }
    
    // This endpoint doesn't exist in your backend yet, but would be useful to have
    // You could filter the results client-side for now
    return this.getAllTeamMembers().pipe(
      tap(members => {
        const userMembers = members.filter(member => member.user.id === userId);
        console.log('Current user team memberships:', userMembers);
      }),
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
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
