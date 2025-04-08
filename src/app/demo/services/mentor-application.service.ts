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

  createApplication(application: any, cvFile: File | null, uploadPaperFile: File | null): Observable<any> {
    const formData = new FormData();
    
    // Stringify the application object and add it to FormData
    formData.append('application', new Blob([JSON.stringify(application)], {
      type: 'application/json'
    }));
    
    if (cvFile) {
      formData.append('cvFile', cvFile);
    }
    
    if (uploadPaperFile) {
      formData.append('uploadPaperFile', uploadPaperFile);
    }

    return this.http.post(this.apiUrl, formData);
  }

  downloadFile(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/${filename}`, {
      responseType: 'blob'
    });
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

