import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Team } from '../models/team';
import { StorageService } from './storage.service';
import { User } from '../models/user.model';
import { catchError, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'http://localhost:9100/api/teams';
  
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  // Get all teams
  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl).pipe(
      tap(teams => console.log('Fetched teams:', teams)),
      catchError(this.handleError)
    );
  }

  // Get team by ID
  getTeamById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${id}`).pipe(
      tap(team => console.log('Fetched team:', team)),
      catchError(this.handleError)
    );
  }

  // Create a new team
  createTeam(team: Partial<Team>, hackathonId: number): Observable<Team> {
    const userId = this.storageService.getLoggedInUserId();
    if (!userId) {
      return throwError(() => new Error('User not logged in'));
    }
    
    console.log('Creating team with payload:', team, 'hackathonId:', hackathonId, 'userId:', userId);
    return this.http.post<Team>(`${this.apiUrl}/create/${hackathonId}/${userId}`, team).pipe(
      tap(createdTeam => console.log('Created team:', createdTeam)),
      catchError((error) => {
        console.error('Error creating team:', error);
        console.error('Request URL:', `${this.apiUrl}/create/${hackathonId}/${userId}`);
        console.error('Request payload:', team);
        if (error.error) {
          console.error('Error response body:', error.error);
        }
        return this.handleError(error);
      })
    );
  }

  // Join a team by ID
  joinTeam(teamId: number): Observable<Team> {
    const userId = this.storageService.getLoggedInUserId();
    if (!userId) {
      return throwError(() => new Error('User not logged in'));
    }
    
    return this.http.post<Team>(`${this.apiUrl}/join-team/${teamId}/${userId}`, {}).pipe(
      tap(team => console.log('Joined team:', team)),
      catchError(this.handleError)
    );
  }

  // Join a team by code
  joinTeamByCode(teamCode: string, userId: number): Observable<Team> {
    if (!userId) {
      return throwError(() => new Error('User not logged in'));
    }
    
    return this.http.post<Team>(`${this.apiUrl}/join/${teamCode}/${userId}`, {}).pipe(
      tap(team => console.log('Joined team by code:', team)),
      catchError(this.handleError)
    );
    
  }



  // Regenerate team code
  regenerateTeamCode(teamId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${teamId}/regenerate-code`, {}).pipe(
      tap(response => console.log('Regenerated team code:', response)),
      catchError(this.handleError)
    );
  }

  // Leave a team
  leaveTeam(teamId: number): Observable<any> {
    const userId = this.storageService.getLoggedInUserId();
    if (!userId) {
      return throwError(() => new Error('User not logged in'));
    }
    
    return this.http.post<any>(`${this.apiUrl}/leave/${userId}/${teamId}`, {}).pipe(
      tap(response => console.log('Left team:', response)),
      catchError(this.handleError)
    );
  }

  // Delete a team
  deleteTeam(teamId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${teamId}`).pipe(
      tap(response => console.log('Deleted team:', response)),
      catchError(this.handleError)
    );
  }

  // Update a team
  updateTeam(team: Team): Observable<Team> {
    // Only send the fields the backend expects. If your backend expects 'name', switch below.
    const teamData: any = {
      id: team.id,
      teamName: team.teamName, // Use 'teamName' to match backend expectation
      isPublic: team.isPublic
    };

    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Updating team with data:', JSON.stringify(teamData));
    
    return this.http.put<any>(`${this.apiUrl}/update-team/${team.id}`, teamData, { headers })
      .pipe(
        tap(updatedTeam => console.log('Updated team:', updatedTeam)),
        catchError((error: HttpErrorResponse) => {
          console.error('Error updating team:', error);
          console.error('Request payload:', teamData);
          console.error('Response body:', error.error);
          
          let errorMessage = 'Failed to update team';
          if (error.error && typeof error.error === 'string') {
            errorMessage += `: ${error.error}`;
          } else if (error.error && error.error.message) {
            errorMessage += `: ${error.error.message}`;
          } else {
            errorMessage += ` (Status: ${error.status})`;
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  // Validate team code
  validateTeamCode(teamCode: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/validate-code/${teamCode}`).pipe(
      tap(response => console.log('Team code validation:', response)),
      catchError(this.handleError)
    );
  }

  // Get available public teams
  getAvailablePublicTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/public`).pipe(
      tap(teams => console.log('Fetched public teams:', teams)),
      catchError(this.handleError)
    );
  }

  // Get public teams by hackathon ID
  getPublicTeamsByHackathonId(hackathonId: number): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/public/hackathon/${hackathonId}`).pipe(
      tap(teams => console.log(`Fetched public teams for hackathon ${hackathonId}:`, teams)),
      catchError(this.handleError)
    );
  }

  // Get user's team for a specific hackathon
  getUserTeamForHackathon(hackathonId: number): Observable<Team | null> {
    const userId = this.storageService.getLoggedInUserId();
    if (!userId) {
      return throwError(() => new Error('User not logged in'));
    }
    
    return this.http.get<Team>(`${this.apiUrl}/user/${userId}/hackathon/${hackathonId}`).pipe(
      tap(team => console.log(`Fetched user's team for hackathon ${hackathonId}:`, team)),
      catchError(error => {
        // If 404 (not found), it means the user doesn't have a team for this hackathon
        if (error.status === 404) {
          return new Observable<null>(subscriber => {
            subscriber.next(null);
            subscriber.complete();
          });
        }
        return this.handleError(error);
      })
    );
  }



  removeTeamMember(teamId: number, memberId: number): Observable<any> {
    // Use the team-members service endpoint structure
    return this.http.delete(`http://localhost:9100/api/team-members/delete/${memberId}`).pipe(
      tap(response => console.log('Removed team member:', response)),
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
      console.error('Error headers:', error.headers);
      console.error('Full error:', error);
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }



  getAvailableMentorsForHackathon(hackathonId: number): Observable<User[]> {
    return this.http.get<User[]>(`http://localhost:9100/api/mentor-recommendations/hackathon/${hackathonId}/mentors`);
  }
  
  assignMentorToTeam(teamId: number, mentorId: number): Observable<any> {
    return this.http.post<any>(`http://localhost:9100/api/mentor-recommendations/team/${teamId}/assign`, {
      mentorId: mentorId
    });
  }


  addTeamMember(teamId: number, userId: number): Observable<any> {
    // First get the team to retrieve its join code
    return this.getTeamById(teamId).pipe(
      switchMap(team => {
        if (!team.teamCode) {
          return throwError(() => new Error('Team code not available'));
        }
        
        // Then use the join endpoint with the team code
        return this.http.post<Team>(`${this.apiUrl}/join/${team.teamCode}/${userId}`, {}).pipe(
          tap(response => console.log('Added team member:', response)),
          catchError(this.handleError)
        );
      }),
      catchError(this.handleError)
    );
  }
}
