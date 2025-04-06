import { Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';

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

  getUserRoles(token: string): string[] {
    if (!token) {
        throw new Error("Token is required");
    }

    try {
        // Decode the token
        const decodedToken = jwtDecode<JwtPayload>(token);
        // Extract the roles
        const roles: string[] = decodedToken.roles || [];
        return roles;
    } catch (error) {
        console.error("Failed to decode token or extract roles:", error);
        return [];
    }
}
}