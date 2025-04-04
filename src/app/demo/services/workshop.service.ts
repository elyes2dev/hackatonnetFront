import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workshop } from '../models/workshop.model';

@Injectable({
  providedIn: 'root'
})
export class WorkshopService {

  private apiUrl = 'http://localhost:9100/pi/workshops';  // Base URL for Workshop API

  constructor(private http: HttpClient) { }

  addWorkshop(workshop: Workshop): Observable<Workshop> {
    return this.http.post<Workshop>(`${this.apiUrl}/add`, workshop);
  }

  getWorkshopById(id: number): Observable<Workshop | null> {
    return this.http.get<Workshop | null>(`${this.apiUrl}/${id}`);
  }

  getAllWorkshops(): Observable<Workshop[]> {
    return this.http.get<Workshop[]>(this.apiUrl);
  }

  deleteWorkshop(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

    // ✅ New: Update an existing workshop
    updateWorkshop(id: number, workshop: Workshop): Observable<Workshop> {
      return this.http.put<Workshop>(`${this.apiUrl}/${id}`, workshop);
    }
}