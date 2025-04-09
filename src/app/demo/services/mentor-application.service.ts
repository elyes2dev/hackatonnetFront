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



// mentor-application.service.ts (updated createApplication method)
createApplication(application: MentorApplication, cvFile: File, uploadPaperFile?: File): Observable<MentorApplication> {
  const formData = new FormData();
  
  // Add each field individually
  formData.append('applicationText', application.applicationText);
  
  // For arrays like links, use indexed notation that Spring can understand
  if (application.links && application.links.length > 0) {
    application.links.forEach((link, index) => {
      formData.append(`links[${index}]`, link);
    });
  }
  
  formData.append('hasPreviousExperience', application.hasPreviousExperience.toString());
  formData.append('status', application.status);
  
  // Add files
  formData.append('cvFile', cvFile);
  if (uploadPaperFile) {
    formData.append('uploadPaperFile', uploadPaperFile);
  }

  return this.http.post<MentorApplication>(this.apiUrl, formData);
}

  updateApplicationStatus(id: number, status: ApplicationStatus): Observable<MentorApplication> {
    return this.http.patch<MentorApplication>(`${this.apiUrl}/${id}/status?status=${status}`, {})
  }

  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  updateApplication(id: number, application: MentorApplication, cvFile?: File, uploadPaperFile?: File): Observable<MentorApplication> {
    const formData = new FormData();
    
    formData.append('application', new Blob([JSON.stringify(application)], {
      type: 'application/json'
    }));
    
    if (cvFile) {
      formData.append('cvFile', cvFile);
    }
    if (uploadPaperFile) {
      formData.append('uploadPaperFile', uploadPaperFile);
    }

    return this.http.put<MentorApplication>(`${this.apiUrl}/${id}`, formData);
  }

  downloadCv(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/cv`, {
      responseType: 'blob'
    });
  }

  downloadUploadPaper(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/upload-paper`, {
      responseType: 'blob'
    });
  }

}

