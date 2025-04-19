import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from '../models/question.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PdfQuizService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  generateQuizFromPdf(file: File, workshopId: number): Observable<Question[]> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workshopId', workshopId.toString());

    return this.http.post<Question[]>(`${this.baseUrl}/quiz/generate`, formData);
  }
} 