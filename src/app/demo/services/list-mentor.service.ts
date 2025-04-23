import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MentorApplication, ApplicationStatus } from '../models/mentor-application.model';
import { ListMentor } from '../models/list-mentor.model';

@Injectable({
  providedIn: 'root'
})
export class ListMentorService {
  private baseUrl = 'http://localhost:9100/api/list-mentors';

  constructor(private http: HttpClient) { }

  // Create a new mentor listing with specific user and hackathon
  createListMentor(userId: number, hackathonId: number, numberOfTeams: number): Observable<ListMentor> {
    const listMentor = {
      numberOfTeams: numberOfTeams,
      mentor: { id: userId },
      hackathon: { id: hackathonId }
    };

    return this.http.post<ListMentor>(this.baseUrl, listMentor);
  }

  // Get all mentor listings
  getAllListMentors(): Observable<ListMentor[]> {
    return this.http.get<ListMentor[]>(this.baseUrl);
  }

  // Get mentor listing by ID
  getListMentorById(id: number): Observable<ListMentor> {
    return this.http.get<ListMentor>(`${this.baseUrl}/${id}`);
  }

  // Get listings by mentor ID
  getListMentorsByMentorId(mentorId: number): Observable<ListMentor[]> {
    return this.http.get<ListMentor[]>(`${this.baseUrl}/mentor/${mentorId}`);
  }

  // Get listings by hackathon ID
  getListMentorsByHackathonId(hackathonId: number): Observable<ListMentor[]> {
    return this.http.get<ListMentor[]>(`${this.baseUrl}/hackathon/${hackathonId}`);
  }

  updateListMentor(id: number, numberOfTeams: number): Observable<ListMentor> {
    const listMentor = {
      numberOfTeams: numberOfTeams
    };
    return this.http.put<ListMentor>(`${this.baseUrl}/${id}`, listMentor);
  }

  // Delete a mentor listing
  deleteListMentor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}