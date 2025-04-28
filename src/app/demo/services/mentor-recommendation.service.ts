import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MentorRecommendationService {
  private apiUrl = 'http://localhost:9100/api/mentor-recommendations'; // Adjust port as needed

  constructor(private http: HttpClient) { }

  /**
   * Get recommended mentors for a specific team
   * @param teamId The ID of the team
   * @param hackathonId The ID of the hackathon
   * @returns Observable with mentor recommendations
   */
  getMentorRecommendations(teamId: number, hackathonId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/mentors/${teamId}?hackathonId=${hackathonId}`, {});
  }

  /**
   * Get all available mentors for a specific hackathon
   * @param hackathonId The ID of the hackathon
   * @returns Observable with list of mentor users
   */
  getAvailableMentorsForHackathon(hackathonId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/hackathon/${hackathonId}/mentors`);
  }

  /**
   * Manually assign a mentor to a team
   * @param teamId The ID of the team
   * @param mentorId The ID of the mentor to assign
   * @returns Observable with success message
   */
  assignMentorToTeam(teamId: number, mentorId: number): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrl}/team/${teamId}/assign`, { mentorId });
  }

  /**
 * Check if a mentor is available for assignment in a hackathon
 * @param mentorId The ID of the mentor
 * @param hackathonId The ID of the hackathon
 * @returns Observable with availability status
 */
checkMentorAvailability(mentorId: number, hackathonId: number): Observable<{available: boolean, currentTeams: number, maxTeams: number}> {
  return this.http.get<{available: boolean, currentTeams: number, maxTeams: number}>(
    `${this.apiUrl}/mentors/${mentorId}/availability?hackathonId=${hackathonId}`
  );
}

/**
 * Get recommended available mentors for a specific team
 * @param teamId The ID of the team
 * @param hackathonId The ID of the hackathon
 * @returns Observable with available mentor recommendations
 */
getAvailableMentorRecommendations(teamId: number, hackathonId: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/available-mentors/${teamId}?hackathonId=${hackathonId}`, {});
}
}