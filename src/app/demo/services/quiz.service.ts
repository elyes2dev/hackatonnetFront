import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Quiz } from '../models/quiz.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private baseUrl = 'http://localhost:9100/quiz';
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createQuiz(quiz: Quiz): Observable<Quiz> {
    return this.http.post<Quiz>(this.baseUrl, quiz);
  }

  updateQuiz(id: number, quiz: Quiz): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.baseUrl}/${id}`, quiz);
  }

  getQuizById(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.baseUrl}/${id}`);
  }

  getAllQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(this.baseUrl);
  }

  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

    // 🆕 Get quizzes by workshop
    getQuizzesByWorkshop(workshopId: number): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(`${this.baseUrl}/workshops/${workshopId}/quizzes`);
      }

  saveQuestion(question: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/quiz/questions`, question);
  }

  getQuestions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/quiz/questions`);
  }
}
