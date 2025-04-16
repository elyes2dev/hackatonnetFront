import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserQuizScore } from '../models/user-quiz-score.model';
import { UserQuizScoreRequest } from '../models/user-quiz-score-request.model';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserQuizScoreService {
  private baseUrl = 'http://localhost:9100/score';

  constructor(private http: HttpClient) {}

  getUserScoreForQuiz(userId: number, quizId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/user/${userId}/quiz/${quizId}`);
  }

  getUserScores(userId: number): Observable<UserQuizScore[]> {
    return this.http.get<UserQuizScore[]>(`${this.baseUrl}/user/${userId}`);
  }

  getQuizScores(quizId: number): Observable<UserQuizScore[]> {
    return this.http.get<UserQuizScore[]>(`${this.baseUrl}/quiz/${quizId}`);
  }
  saveScore(request: UserQuizScoreRequest): Observable<UserQuizScore> {
    if (!request.userId || !request.quizId) {
      alert("User ID and Quiz ID are required!");
      // Return an error observable
      return throwError(() => new Error("User ID and Quiz ID are required"));
    }
  
    return this.http.post<UserQuizScore>(this.baseUrl, request);
  }
  

  deleteScore(userId: number, quizId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/user/${userId}/quiz/${quizId}`);
  }

  hasUserTakenQuiz(userId: number, quizId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/user/${userId}/quiz/${quizId}/exists`);
  }
}
