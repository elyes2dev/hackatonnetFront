// src/app/services/sponsor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SponsorInfoDTO } from '../models/prize';
import { SponsorReward } from '../models/sponsor-reward';


@Injectable({
  providedIn: 'root'
})
export class SponsorRewardService {
  private apiUrl = 'http://localhost:9100/sponsor-reward';

  constructor(private http: HttpClient) { }

  getTopSponsors(): Observable<SponsorInfoDTO[]> {
    return this.http.get<SponsorInfoDTO[]>(`${this.apiUrl}/top-sponsors`);
  }

  getSponsorReward(sponsorId: number): Observable<SponsorReward> {
    return this.http.get<SponsorReward>(`${this.apiUrl}/getreward/${sponsorId}`);
  }
}