import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { CustomJwtPayload } from '../interfaces/jwt-payload.interface';
import { catchError, map, Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly userIdKey = 'loggedid';
  private apiUrl = 'http://localhost:9100/api';

  constructor(private http: HttpClient) {}


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


  getUserRoles(token: string): string[] {
    if (!token) {
        throw new Error("Token is required");
    }

    try {
        // Decode the token
        const decodedToken = jwtDecode<CustomJwtPayload>(token);
        // Extract the roles
        const roles: string[] = decodedToken.roles || [];
        return roles;
    } catch (error) {
        console.error("Failed to decode token or extract roles:", error);
        return [];
    }
}

/////////////////////////////////////////////////////////////

getUserRole(token: string): string[] {
  if (!token) {
      throw new Error("Token is required");
  }

  try {
      // Decode the token
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      // Extract the roles
      const roles: string[] = decodedToken.roles || [];
      return roles;
  } catch (error) {
      console.error("Failed to decode token or extract roles:", error);
      return [];
  }
}

// Get user by ID
getUserById(userId: number): Observable<User> {
  return this.http.get<User>(`${this.apiUrl}/users/${userId}`).pipe(
    catchError(error => {
      console.error('Error fetching user:', error);
      return of({} as User);
    })
  );
}

// Check if current user has admin role
checkUserIsAdmin(): Observable<boolean> {
  const userId = this.getLoggedInUserId();
  if (!userId) {
    return of(false);
  }
  
  return this.getUserById(userId).pipe(
    map(user => {
      if (user && user.roles && user.roles.length > 0) {
        console.log('User roles:', user.roles.map(role => role.name));
        // Check if any role has name 'admin' (case insensitive)
        return user.roles.some(role => 
          role.name.toLowerCase() === 'admin'
        );
      }
      console.log('No roles found for the user');
      return false;
    }),
    catchError(error => {
      console.error('Error checking admin status:', error);
      return of(false);
    })
  );
}


}
