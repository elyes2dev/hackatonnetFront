// src/app/demo/service/team-submission.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TeamSubmission } from '../api/team-submission';

@Injectable({
  providedIn: 'root'
})
export class TeamSubmissionService {
  private apiUrl = 'http://localhost:9100/api/team-submissions'; // Supprime "/pi" si ce n'est pas dans ton backend

  constructor(private http: HttpClient) {}

  getAllSubmissions(): Observable<TeamSubmission[]> {
    return this.http.get<TeamSubmission[]>(this.apiUrl);
  }

  getSubmissionById(id: number): Observable<TeamSubmission> {
    return this.http.get<TeamSubmission>(`${this.apiUrl}/${id}`);
  }

  getSubmissionsByHackathonId(hackathonId: number): Observable<TeamSubmission[]> {
    // Try a different endpoint structure - the backend might use a query parameter instead
    return this.http.get<TeamSubmission[]>(`${this.apiUrl}?hackathonId=${hackathonId}`);
  }

  createSubmission(submission: TeamSubmission): Observable<string> {
    // Ensure all required fields are present
    const body = {
      projectName: submission.projectName,
      description: submission.description,
      repoLink: submission.repoLink,
      // Make sure teamMember is properly formatted
      teamMember: submission.teamMember ? { id: submission.teamMember.id } : null
      // Note: hackathonId, teamId, and technologies are not recognized by the backend
    };
    
    console.log('Submission data being sent:', body);
    
    // Use the HttpClient with error handling
    return this.http.post(`${this.apiUrl}`, body, { 
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map(response => {
        console.log('Submission response:', response);
        return response.body || 'Success';
      }),
      catchError(error => {
        console.error('Submission error details:', error);
        if (error.error && typeof error.error === 'object') {
          console.error('Error response body:', JSON.stringify(error.error));
        } else if (error.error) {
          console.error('Error text:', error.error);
        }
        return throwError(() => error);
      })
    );
  }

  updateSubmission(id: number, submission: TeamSubmission): Observable<TeamSubmission> {
    const body = {
      ...submission,
      teamMember: submission.teamMember ? { id: submission.teamMember.id } : null
    };
    return this.http.put<TeamSubmission>(`${this.apiUrl}/${id}`, body);
  }

  deleteSubmission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}