import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private baseUrl = 'http://localhost:9100/images';

  constructor(private http: HttpClient) { }

  getImage(imageId: number): Observable<Blob> {
    const url = `${this.baseUrl}/${imageId}`;  // Fixed URL (added missing slash)
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = this.getServerErrorMessage(error);
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 404:
        return 'The requested image was not found.';
      case 403:
        return 'You do not have permission to access this image.';
      case 500:
        return 'Internal server error occurred while fetching the image.';
      default:
        return `Server returned error: ${error.status} - ${error.statusText}`;
    }
  }
}