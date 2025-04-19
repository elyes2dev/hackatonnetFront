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
    const token = localStorage.getItem('eyJhbGciOiJIUzUxMiJ9.eyJyb2xlcyI6IltdIiwidXNlcmlkIjoiMyIsInN1YiI6IlRhc25pbSIsImlhdCI6MTc0NTA4MDY4NCwiZXhwIjoxNzQ1MTY3MDg0fQ.F9CjZCsPfnPwaXBa0yEUIpfRGZoTbFt_LsFuxfBPxDJn3eSfskioxtgIKqxgIz-XpJD0f4m8I2U-9HFrvsI_fA');
    
    if (token) {
      const cloned = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned);
    }
    
    return next.handle(request);
  }
}