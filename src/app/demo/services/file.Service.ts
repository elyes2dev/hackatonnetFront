import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
  })
  export class FileService {
    private apiUrl = `http://localhost:9100/api/files`;
  
    constructor(private http: HttpClient) { }
  
    uploadFile(file: File): Observable<string> {
      const formData = new FormData();
      formData.append('file', file);
  
      return this.http.post(`${this.apiUrl}/upload`, formData, {
        responseType: 'text'
      });
    }
  
    downloadFile(fileName: string): Observable<Blob> {
      return this.http.get(`${this.apiUrl}/download/${fileName}`, {
        responseType: 'blob'
      });
    }
  
    getFileUrl(fileName: string): string {
      return `${environment.apiUrl}/api/files/download/${fileName}`;
    }
  }