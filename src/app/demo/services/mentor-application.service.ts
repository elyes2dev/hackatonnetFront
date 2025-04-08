import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MentorApplication, ApplicationStatus } from '../models/mentor-application.model';

@Injectable({
  providedIn: 'root'
})
export class MentorApplicationService {
  private apiUrl = `http://localhost:9100/api/mentor-applications`

  constructor(private http: HttpClient) {}

  getAllApplications(): Observable<MentorApplication[]> {
    return this.http.get<MentorApplication[]>(this.apiUrl)
  }

  getApplicationById(id: number): Observable<MentorApplication> {
    return this.http.get<MentorApplication>(`${this.apiUrl}/${id}`)
  }

  getApplicationsByMentorId(mentorId: number): Observable<MentorApplication[]> {
    return this.http.get<MentorApplication[]>(`${this.apiUrl}/mentor/${mentorId}`)
  }

  getApplicationsByStatus(status: ApplicationStatus): Observable<MentorApplication[]> {
    return this.http.get<MentorApplication[]>(`${this.apiUrl}/status/${status}`)
  }

  getApplicationsByExperience(hasPreviousExperience: boolean): Observable<MentorApplication[]> {
    return this.http.get<MentorApplication[]>(
      `${this.apiUrl}/experience?hasPreviousExperience=${hasPreviousExperience}`,
    )
  }


  createApplication(application: MentorApplication, cvFile?: File, uploadPaperFile?: File): Observable<MentorApplication> {
    const formData = new FormData();
    
    // Convert application to JSON string
    const appBlob = new Blob([JSON.stringify(application)], {
      type: 'application/json'
    });
    formData.append('application', appBlob);
    
    if (cvFile) {
      formData.append('cv', cvFile);
    }
    
    if (uploadPaperFile) {
      formData.append('uploadPaper', uploadPaperFile);
    }
    
    return this.http.post<MentorApplication>(this.apiUrl, formData);
  }


  updateApplication(id: number, application: MentorApplication): Observable<MentorApplication> {
    return this.http.put<MentorApplication>(`${this.apiUrl}/${id}`, application)
  }

  updateApplicationStatus(id: number, status: ApplicationStatus): Observable<MentorApplication> {
    return this.http.patch<MentorApplication>(`${this.apiUrl}/${id}/status?status=${status}`, {})
  }

  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}

