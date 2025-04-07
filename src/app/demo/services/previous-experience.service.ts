import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PreviousExperience } from '../models/previous-experience.model';

@Injectable({
  providedIn: 'root'
})
export class PreviousExperienceService {
  private apiUrl = `http://localhost:9100/api/previous-experiences`

  constructor(private http: HttpClient) {}

  getAllExperiences(): Observable<PreviousExperience[]> {
    return this.http.get<PreviousExperience[]>(this.apiUrl)
  }

  getExperienceById(id: number): Observable<PreviousExperience> {
    return this.http.get<PreviousExperience>(`${this.apiUrl}/${id}`)
  }

  getExperiencesByApplicationId(applicationId: number): Observable<PreviousExperience[]> {
    return this.http.get<PreviousExperience[]>(`${this.apiUrl}/application/${applicationId}`)
  }

  getExperiencesByYear(year: number): Observable<PreviousExperience[]> {
    return this.http.get<PreviousExperience[]>(`${this.apiUrl}/year/${year}`)
  }

  getExperiencesByHackathonName(keyword: string): Observable<PreviousExperience[]> {
    return this.http.get<PreviousExperience[]>(`${this.apiUrl}/hackathon?keyword=${keyword}`)
  }

  createExperience(applicationId: number, experience: PreviousExperience): Observable<PreviousExperience> {
    return this.http.post<PreviousExperience>(`${this.apiUrl}/application/${applicationId}`, experience)
  }

  updateExperience(id: number, experience: PreviousExperience): Observable<PreviousExperience> {
    return this.http.put<PreviousExperience>(`${this.apiUrl}/${id}`, experience)
  }

  deleteExperience(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}

