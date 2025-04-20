import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthValidationService {
  validateEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  validatePassword(password: string): boolean {
    return password.length >= 8;
  }

  // Add more validation methods as needed
}