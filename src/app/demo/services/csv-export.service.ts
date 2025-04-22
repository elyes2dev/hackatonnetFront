// src/app/services/csv-export.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CsvExportService {
  private baseUrl = 'http://localhost:9100/api/export'; // Adjust to your backend URL

  constructor(private http: HttpClient) { }

  exportMentorsToCSV(hackathonId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/mentors/csv/${hackathonId}`, {
      responseType: 'blob'
    });
  }
}