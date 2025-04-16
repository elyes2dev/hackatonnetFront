// src/app/services/prize.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Prize, SponsorInfoDTO } from '../models/prize';

@Injectable({
  providedIn: 'root'
})
export class PrizeService {
  private baseUrl = 'http://localhost:9100/prize';
  
   // For testing without authentication - static user ID
   private staticUserId = 2; // Change this to your test user ID

    // For testing without hackathon - static hackathon ID
  private staticHackathonId = 1; // Change this to your test hackathon ID

  constructor(private http: HttpClient) { }


  createPrize(prize: Prize): Observable<Prize> {
    // Since we're using static values, we'll always use the same IDs
    return this.http.post<Prize>(`${this.baseUrl}/${this.staticUserId}/${this.staticHackathonId}/create`, prize);
  }

  getAllPrizes(): Observable<Prize[]> {
    return this.http.get<Prize[]>(`${this.baseUrl}/getallprizes`);
  }

  getPrizeById(id: number): Observable<Prize> {
    return this.http.get<Prize>(`${this.baseUrl}/getprizebyid/${id}`);
  }

  getPrizesByHackathon(): Observable<Prize[]> {
    // Always use the static hackathon ID
    return this.http.get<Prize[]>(`${this.baseUrl}/getprizebyhackathon/${this.staticHackathonId}`);
  }

  getPrizesBySponsor(): Observable<Prize[]> {
    // Always use the static sponsor ID
    return this.http.get<Prize[]>(`${this.baseUrl}/getprizebysponsor/${this.staticUserId}`);
  }

  approvePrize(id: number): Observable<Prize> {
    return this.http.put<Prize>(`${this.baseUrl}/${id}/approve`, {});
  }

  rejectPrize(id: number): Observable<Prize> {
    return this.http.put<Prize>(`${this.baseUrl}/${id}/reject`, {});
  }

  cancelPrize(prizeId: number): Observable<Prize> {
    // Always use the static sponsor ID
    return this.http.put<Prize>(`${this.baseUrl}/${prizeId}/cancel/${this.staticUserId}`, {});
  }

  deletePrize(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getSponsorsByHackathon(): Observable<SponsorInfoDTO[]> {
    // Always use the static hackathon ID
    return this.http.get<SponsorInfoDTO[]>(`${this.baseUrl}/sponsors-by-badge/${this.staticHackathonId}`);
  }
}