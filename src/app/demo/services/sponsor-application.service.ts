// src/app/services/sponsor-application.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SponsorApplication } from '../models/sponsor-application';

@Injectable({
  providedIn: 'root'
})
export class SponsorApplicationService {
  private baseUrl = 'http://localhost:9100/sponsor-application';
  
  // For testing without authentication - static user ID
  private staticUserId = 17; // Change this to your test user ID

  constructor(private http: HttpClient) { }

  // Submit application
  submitApplication(application: SponsorApplication): Observable<SponsorApplication> {
    return this.http.post<SponsorApplication>(`${this.baseUrl}/${this.staticUserId}/submit`, application);
  }

  // Get all applications
  getAllApplications(): Observable<SponsorApplication[]> {
    return this.http.get<SponsorApplication[]>(`${this.baseUrl}/getallapplications`);
  }

  // Get application by ID
  getApplicationById(id: number): Observable<SponsorApplication> {
    return this.http.get<SponsorApplication>(`${this.baseUrl}/getapplicationbyid/${id}`);
  }

  // Approve application
  approveApplication(id: number): Observable<SponsorApplication> {
    return this.http.put<SponsorApplication>(`${this.baseUrl}/${id}/approve`, {});
  }

  // Reject application
  rejectApplication(id: number): Observable<SponsorApplication> {
    return this.http.put<SponsorApplication>(`${this.baseUrl}/${id}/reject`, {});
  }

  // Delete application
  deleteApplication(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deleteapplication/${id}`);
  }
}