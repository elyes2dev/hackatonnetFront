import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Question } from '../models/question.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiQuizService {
  private baseUrl = 'http://localhost:5050/api';  // Keep this separate from the main API URL

  constructor(private http: HttpClient) {}

  generateQuizFromPDF(file: File): Observable<{ success: boolean; questions: Question[] }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ success: boolean; questions: Question[] }>(
      `${this.baseUrl}/generate-quiz`,
      formData,
      {
        headers: {
          // Don't set Content-Type header, let the browser set it with the correct boundary for FormData
          Accept: 'application/json'
        }
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    let errorMessage = 'An error occurred while processing your request.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('Client-side error:', error.error.message);
      errorMessage = error.error.message;
    } else {
      // Server-side error
      console.error('Server-side error:', error);
      if (error.error?.message) {
        errorMessage = error.error.message;
        if (error.error?.traceback) {
          console.error('Error traceback:', error.error.traceback);
        }
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check if the server is running.';
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }

    return throwError(() => errorMessage);
  }
} 