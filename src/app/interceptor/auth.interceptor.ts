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
    const token = localStorage.getItem('eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiVVNFUiIsInN1YiI6ImdnIiwiaWF0IjoxNzQ0NTgyMTAwLCJleHAiOjE3NDQ2Njg1MDB9.SEG0JLaejzV64vFDu3hfn2xjOcGVpr_lG3N-3klRx6HufF1jCdYYaIS4NmhuGRZdqkk0OtCZxxiN_-QXen2_1Q');
    
    if (token) {
      const cloned = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned);
    }
    
    return next.handle(request);
  }
}