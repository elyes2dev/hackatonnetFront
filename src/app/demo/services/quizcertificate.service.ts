// quiz-certificate.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QuizCertificateService {

  private baseUrl = 'http://localhost:9100/pi/certificates';

  constructor(private http: HttpClient) { }

  downloadCertificate(username: string, quizTitle: string, score: number) {
    const params = new HttpParams()
      .set('username', username)
      .set('quizTitle', quizTitle)
      .set('score', score.toString());

    return this.http.get(`${this.baseUrl}/download`, {
      params,
      responseType: 'blob', // Important for binary data like PDF
      observe: 'response'
    });
  }
}
