import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hackathon } from 'src/app/demo/models/hackathon'; // Path to your Hackathon model
@Injectable({
  providedIn: 'root'
})
export class HackathonService {
  private apiUrl = 'http://localhost:9100/pi/hackathons'; // Adjust based on your Spring Boot backend URL

  constructor(private http: HttpClient) {}

  getHackathons(): Observable<Hackathon[]> {
    return this.http.get<Hackathon[]>(this.apiUrl);  // Get hackathons from Spring Boot backend
  }

  getHackathonById(id: string): Observable<Hackathon> {
    return this.http.get<Hackathon>(`${this.apiUrl}/get-hackathon/${id}`);  // Assumes API supports this route
  }

  createHackathon(hackathon: Hackathon): Observable<Hackathon> {
    return this.http.post<Hackathon>(`${this.apiUrl}/create-hackathon`, hackathon);
  }

  updateHackathon(id: number, hackathon: Hackathon): Observable<Hackathon> {
    return this.http.put<Hackathon>(`${this.apiUrl}/update-hackathon/${id}`, hackathon);
  }

  deleteHackathon(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
