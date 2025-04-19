import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiVVNFUiIsInN1YiI6IlRhc25pbSIsImlhdCI6MTc0NDg4MDQ0OSwiZXhwIjoxNzQ0OTY2ODQ5fQ.oa1dUL6RP8SECJsDWAfB79aSYqvM8PxHGj4-OKBaUP17hL2A9asp2OuFbXlb4WgdqMfUUqCEr9I1Eb_5wawHPg');
    
    if (token) {
      const cloned = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned);
    }
    
    return next.handle(request);
  }
}