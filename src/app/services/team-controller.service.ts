import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { createTeam } from '../fn/team-controller/create-team';
import { CreateTeam$Params } from '../fn/team-controller/create-team';
import { deleteTeam } from '../fn/team-controller/delete-team';
import { DeleteTeam$Params } from '../fn/team-controller/delete-team';
import { getAllTeams } from '../fn/team-controller/get-all-teams';
import { GetAllTeams$Params } from '../fn/team-controller/get-all-teams';
import { getAvailablePublicTeams } from '../fn/team-controller/get-available-public-teams';
import { GetAvailablePublicTeams$Params } from '../fn/team-controller/get-available-public-teams';
import { getTeamById } from '../fn/team-controller/get-team-by-id';
import { GetTeamById$Params } from '../fn/team-controller/get-team-by-id';
import { joinTeam } from '../fn/team-controller/join-team';
import { JoinTeam$Params } from '../fn/team-controller/join-team';
import { leaveTeam } from '../fn/team-controller/leave-team';
import { LeaveTeam$Params } from '../fn/team-controller/leave-team';
import { regenerateTeamCode } from '../fn/team-controller/regenerate-team-code';
import { RegenerateTeamCode$Params } from '../fn/team-controller/regenerate-team-code';
import { Team } from '../models/team';
import { updateTeam } from '../fn/team-controller/update-team';
import { UpdateTeam$Params } from '../fn/team-controller/update-team';
import { validateTeamCode } from '../fn/team-controller/validate-team-code';
import { ValidateTeamCode$Params } from '../fn/team-controller/validate-team-code';

@Injectable({ providedIn: 'root' })
export class TeamControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
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
    return this.http.get<Team>(`${this.rootUrl}/api/teams/${params.id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateTeam(params: UpdateTeam$Params, context?: HttpContext): Observable<Team> {
    return this.http.put<Team>(`${this.rootUrl}/api/teams/${params.id}`, params.body).pipe(
      catchError(this.handleError)
    );
  }

  deleteTeam(params: DeleteTeam$Params, context?: HttpContext): Observable<any> {
    return this.http.delete(`${this.rootUrl}/api/teams/${params.id}`).pipe(
      catchError(this.handleError)
    );
  }

  regenerateTeamCode(params: RegenerateTeamCode$Params, context?: HttpContext): Observable<any> {
    return this.http.post(`${this.rootUrl}/api/teams/${params.teamId}/regenerate-code`, null).pipe(
      catchError(this.handleError)
    );
  }

  joinTeam(params: JoinTeam$Params, context?: HttpContext): Observable<any> {
    console.log('Joining team with params:', params);
    return this.http.post(
      `${this.rootUrl}/api/teams/join/${params.teamCode}/${params.userId}`,
      null
    ).pipe(
      tap(response => console.log('Join team response:', response)),
      catchError(this.handleError)
    );
  }

  leaveTeam(userId: number, teamId: number): Observable<any> {
    console.log('Leaving team:', { userId, teamId });
    return this.http.post(
      `${this.rootUrl}/api/teams/leave/${userId}/${teamId}`,
      null
    ).pipe(
      tap(response => console.log('Leave team response:', response)),
      catchError(this.handleError)
    );
  }

  createTeam(params: CreateTeam$Params, context?: HttpContext): Observable<Team> {
    return this.http.post<Team>(
      `${this.rootUrl}/api/teams/create/${params.hackathonId}/${params.leaderId}`,
      params.body
    ).pipe(
      catchError(this.handleError)
    );
  }

  getAllTeams(params?: GetAllTeams$Params, context?: HttpContext): Observable<Array<Team>> {
    return this.http.get<Array<Team>>(`${this.rootUrl}/api/teams`).pipe(
      catchError(this.handleError)
    );
  }

  validateTeamCode(params: ValidateTeamCode$Params, context?: HttpContext): Observable<any> {
    return this.http.get(
      `${this.rootUrl}/api/teams/validate-code/${params.teamCode}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  getAvailablePublicTeams(params?: GetAvailablePublicTeams$Params, context?: HttpContext): Observable<Array<Team>> {
    return this.http.get<Array<Team>>(`${this.rootUrl}/api/teams/public`).pipe(
      catchError(this.handleError)
    );
  }

  // Legacy method for backward compatibility
  leaveTeamCustom(teamId: number, userId: number): Observable<any> {
    return this.leaveTeam(userId, teamId);
  }
}