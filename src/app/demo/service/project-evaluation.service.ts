import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectEvaluation } from '../api/project-evaluation';
import { TeamSubmission } from '../api/team-submission';

@Injectable({
  providedIn: 'root'
})
export class ProjectEvaluationService {
  private apiUrl = 'http://localhost:9100/api/project-evaluations'; // Supprime "/pi" pour correspondre au backend

  constructor(private http: HttpClient) {}

  // Helper method to get HTTP headers with auth token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getAllEvaluations(): Observable<ProjectEvaluation[]> {
    return this.http.get<ProjectEvaluation[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getEvaluationById(id: number): Observable<ProjectEvaluation> {
    return this.http.get<ProjectEvaluation>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createEvaluation(evaluation: ProjectEvaluation): Observable<string> {
    // Create a very simple payload structure that matches what the backend expects
    const simplePayload = {
      score: evaluation.score,
      feedback: evaluation.feedback,
      submissionId: evaluation.teamSubmission?.id,
      evaluatorId: evaluation.evaluator?.id
    };
  
    console.log('Sending simplified payload:', simplePayload);
  
    // Include authentication headers
    const options = {
      headers: this.getHeaders(), // Make sure this method returns the proper Authorization header
      responseType: 'text' as 'json'
    };
  
    // Send the simplified data with auth headers
    return this.http.post<string>(this.apiUrl, simplePayload, options);
  }
  
  // In your AuthService, make sure getHeaders is implemented correctly:
  

  updateEvaluation(id: number, evaluation: ProjectEvaluation): Observable<ProjectEvaluation> {
    return this.http.put<ProjectEvaluation>(`${this.apiUrl}/${id}`, evaluation, { headers: this.getHeaders() });
  }

  deleteEvaluation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getTopRatedProjects(minScore: number): Observable<ProjectEvaluation[]> {
    return this.http.get<ProjectEvaluation[]>(`${this.apiUrl}/top-rated?minScore=${minScore}`, { headers: this.getHeaders() });
  }

  donateToProject(evaluation: ProjectEvaluation): void {
    console.log('Donation pour le projet:', evaluation.teamSubmission?.projectName || 'Inconnu');
  }

  getSubmissionById(id: number): Observable<TeamSubmission> {
    return this.http.get<TeamSubmission>(`http://localhost:9100/api/team-submissions/${id}`, { headers: this.getHeaders() });
  }

  getAllSubmissions(): Observable<TeamSubmission[]> {
    return this.http.get<TeamSubmission[]>('http://localhost:9100/api/team-submissions', { headers: this.getHeaders() });
  }

  // Get evaluations for a specific submission
  getEvaluationsBySubmissionId(submissionId: number): Observable<ProjectEvaluation[]> {
    return this.http.get<ProjectEvaluation[]>(`${this.apiUrl}/submission/${submissionId}`, { headers: this.getHeaders() });
  }
}