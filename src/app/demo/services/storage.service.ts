import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly userIdKey = 'loggedid';

  constructor() {}

  setUserId(userId: string): void {
    localStorage.setItem(this.userIdKey, userId);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.userIdKey);
  }

  clearUserId(): void {
    localStorage.removeItem(this.userIdKey);
  }
  
  getLoggedInUserId(): number | null {
    const id = localStorage.getItem('loggedid');
    return id ? parseInt(id, 10) : null;
  }
  
}