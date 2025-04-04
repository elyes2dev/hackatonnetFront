import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = 'http://localhost:9100'; // Adjust based on your backend

  constructor(private http: HttpClient) {}

  uploadFile(file: File, type: 'logo' | 'document'): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('type', type); // If your backend needs a file type parameter

    const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
      reportProgress: true, // Enables progress tracking
      responseType: 'text' // Change to text instead of json
    });

    return this.http.request(req).pipe(
      map(event => {
        // If this is a response and contains text, convert it to a format we expect
        if (event instanceof HttpResponse && typeof event.body === 'string') {
          const body = event.body;
          // Extract the filename from the response text
          const match = body.match(/successfully:\s*(.+)$/);
          const filename = match ? match[1] : null;
          
          // Create a new response with the parsed body
          return event.clone({
            body: { filePath: filename }
          });
        }
        return event;
      })
    );
  }

  /**
   * Get the full URL for a file from its filename
   */
  getFileUrl(filename: string | null): string {
    if (!filename) {
      return '';
    }
    return `${this.baseUrl}/upload/files/${filename}`;
  }

  // Add this method to your FileUploadService
downloadFile(filename: string): Observable<Blob> {
  return this.http.get(`${this.baseUrl}/upload/files/${filename}`, {
    responseType: 'blob'
  });
}
}