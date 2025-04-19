import { HttpClient, HttpContext, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, switchMap } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { Team } from '../models/team';
import { AuthService } from './auth.service'; // Import AuthService
import { GetTeamById$Params } from '../fn/team-controller/get-team-by-id';
import { UpdateTeam$Params } from '../fn/team-controller/update-team';
import { DeleteTeam$Params } from '../fn/team-controller/delete-team';
import { RegenerateTeamCode$Params } from '../fn/team-controller/regenerate-team-code';
import { JoinTeam$Params } from '../fn/team-controller/join-team';
import { CreateTeam$Params } from '../fn/team-controller/create-team';
import { GetAllTeams$Params } from '../fn/team-controller/get-all-teams';
import { ValidateTeamCode$Params } from '../fn/team-controller/validate-team-code';
import { GetAvailablePublicTeams$Params } from '../fn/team-controller/get-available-public-teams';

@Injectable({ providedIn: 'root' })
export class TeamControllerService extends BaseService {
  constructor(
    config: ApiConfiguration, 
    http: HttpClient,
    private authService: AuthService // Inject AuthService
  ) {
    super(config, http);
  }

  // Add method to get headers with authentication
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    let errorMessage = 'An error occurred';
    
    if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => errorMessage);
  }

  getTeamById(params: GetTeamById$Params, context?: HttpContext): Observable<Team> {
    return this.http.get<Team>(`${this.rootUrl}/api/teams/${params.id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateTeam(params: UpdateTeam$Params, context?: HttpContext): Observable<Team> {
    return this.http.put<Team>(`${this.rootUrl}/api/teams/${params.id}`, params.body, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  deleteTeam(params: DeleteTeam$Params, context?: HttpContext): Observable<any> {
    return this.http.delete(`${this.rootUrl}/api/teams/${params.id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  regenerateTeamCode(params: RegenerateTeamCode$Params, context?: HttpContext): Observable<any> {
    return this.http.post(`${this.rootUrl}/api/teams/${params.teamId}/regenerate-code`, null, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  joinTeam(params: JoinTeam$Params, context?: HttpContext): Observable<Team> {
    console.log('Joining team with params:', params);
    
    // Skip validation and directly join the team
    return this.http.post<Team>(
      `${this.rootUrl}/api/teams/join/${params.teamCode}/${params.userId}`,
      null,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  leaveTeam(userId: number, teamId: number): Observable<any> {
    console.log('Leaving team:', { userId, teamId });
    return this.http.post(
      `${this.rootUrl}/api/teams/leave/${userId}/${teamId}`,
      null,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => console.log('Leave team response:', response)),
      catchError(this.handleError)
    );
  }

  createTeam(params: CreateTeam$Params, context?: HttpContext): Observable<Team> {
    return this.http.post<Team>(
      `${this.rootUrl}/api/teams/create/${params.hackathonId}/${params.leaderId}`,
      params.body,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getAllTeams(params?: GetAllTeams$Params, context?: HttpContext): Observable<Array<Team>> {
    return this.http.get<Array<Team>>(`${this.rootUrl}/api/teams`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  validateTeamCode(params: ValidateTeamCode$Params, context?: HttpContext): Observable<any> {
    return this.http.get(
      `${this.rootUrl}/api/teams/validate-code/${params.teamCode}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
  getTeamInHackathonForUser(params: { hackathonId: number; userId: number }): Observable<Team> {
    return this.http.get<Team>(
        `${this.rootUrl}/api/teams/hackathon/${params.hackathonId}/user/${params.userId}`,
        { headers: this.getAuthHeaders() }
    ).pipe(
        tap(team => console.log('Team in hackathon for user response:', team)),
        catchError(this.handleError)
    );
}
  getAvailablePublicTeams(params?: GetAvailablePublicTeams$Params, context?: HttpContext): Observable<Array<Team>> {
    return this.http.get<Array<Team>>(`${this.rootUrl}/api/teams/public`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(teams => console.log('Public teams response:', teams)),
      catchError(this.handleError)
    );
  }

  leaveTeamCustom(teamId: number, userId: number): Observable<any> {
    return this.leaveTeam(userId, teamId);
  }
}