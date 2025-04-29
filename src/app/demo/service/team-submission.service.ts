// src/app/demo/service/team-submission.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    const body = {
      ...submission,
      teamMember: submission.teamMember ? { id: submission.teamMember.id } : null
    };
    return this.http.post(`${this.apiUrl}`, body, { responseType: 'text' });
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