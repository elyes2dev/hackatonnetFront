import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectEvaluation } from '../api/project-evaluation';
import { TeamSubmission } from '../api/team-submission';

@Injectable({
  providedIn: 'root'
})
export class ProjectEvaluationService {
  private apiUrl = 'http://localhost:9100/api/project-evaluations'; // Supprime "/pi" pour correspondre au backend

  constructor(private http: HttpClient) {}

  getAllEvaluations(): Observable<ProjectEvaluation[]> {
    return this.http.get<ProjectEvaluation[]>(this.apiUrl);
  }

  getEvaluationById(id: number): Observable<ProjectEvaluation> {
    return this.http.get<ProjectEvaluation>(`${this.apiUrl}/${id}`);
  }

  createEvaluation(evaluation: ProjectEvaluation): Observable<string> { // Changé en string
    return this.http.post<string>(this.apiUrl, evaluation, { responseType: 'text' as 'json' });
  }

  updateEvaluation(id: number, evaluation: ProjectEvaluation): Observable<ProjectEvaluation> {
    return this.http.put<ProjectEvaluation>(`${this.apiUrl}/${id}`, evaluation);
  }

  deleteEvaluation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTopRatedProjects(minScore: number): Observable<ProjectEvaluation[]> {
    return this.http.get<ProjectEvaluation[]>(`${this.apiUrl}/top-rated?minScore=${minScore}`);
  }

  donateToProject(evaluation: ProjectEvaluation): void {
    console.log('Donation pour le projet:', evaluation.teamSubmission?.projectName || 'Inconnu');
  }

  getSubmissionById(id: number): Observable<TeamSubmission> {
    return this.http.get<TeamSubmission>(`http://localhost:9100/api/team-submissions/${id}`);
  }

  getAllSubmissions(): Observable<TeamSubmission[]> {
    return this.http.get<TeamSubmission[]>('http://localhost:9100/api/team-submissions');
  }

  // Get evaluations for a specific submission
  getEvaluationsBySubmissionId(submissionId: number): Observable<ProjectEvaluation[]> {
    return this.http.get<ProjectEvaluation[]>(`${this.apiUrl}/submission/${submissionId}`);
  }
}