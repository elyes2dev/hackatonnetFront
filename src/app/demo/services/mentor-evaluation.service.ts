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


  createEvaluation(evaluation: any): Observable<MentorEvaluation> {
    console.log('Service sending payload:', evaluation); // Debug log
    return this.http.post<MentorEvaluation>(this.apiUrl, evaluation);
  }

  updateEvaluation(id: number, evaluation: any): Observable<MentorEvaluation> {
    console.log('Service updating with payload:', evaluation); // Debug log
    
    return this.http.put<MentorEvaluation>(`${this.apiUrl}/${id}`, evaluation);
  }
  


  deleteEvaluation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  getMentorBadge(mentorId: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/mentor/${mentorId}/badge`);
  }
}

