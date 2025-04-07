import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MentorEvaluation } from '../models/mentor-evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class MentorEvaluationService {
  private apiUrl = `http://localhost:9100/api/mentor-evaluations`

  constructor(private http: HttpClient) {}

  getAllEvaluations(): Observable<MentorEvaluation[]> {
    return this.http.get<MentorEvaluation[]>(this.apiUrl)
  }

  getEvaluationById(id: number): Observable<MentorEvaluation> {
    return this.http.get<MentorEvaluation>(`${this.apiUrl}/${id}`)
  }

  getEvaluationsByMentorId(mentorId: number): Observable<MentorEvaluation[]> {
    return this.http.get<MentorEvaluation[]>(`${this.apiUrl}/mentor/${mentorId}`)
  }

  getEvaluationsByTeamId(teamId: number): Observable<MentorEvaluation[]> {
    return this.http.get<MentorEvaluation[]>(`${this.apiUrl}/team/${teamId}`)
  }

  getEvaluationsByMinimumRating(minRating: number): Observable<MentorEvaluation[]> {
    return this.http.get<MentorEvaluation[]>(`${this.apiUrl}/rating/${minRating}`)
  }

  createEvaluation(evaluation: MentorEvaluation): Observable<MentorEvaluation> {
    return this.http.post<MentorEvaluation>(this.apiUrl, evaluation)
  }

  updateEvaluation(id: number, evaluation: MentorEvaluation): Observable<MentorEvaluation> {
    return this.http.put<MentorEvaluation>(`${this.apiUrl}/${id}`, evaluation)
  }

  deleteEvaluation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}

