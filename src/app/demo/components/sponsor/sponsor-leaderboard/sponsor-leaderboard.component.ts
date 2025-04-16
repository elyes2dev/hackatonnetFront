// src/app/components/sponsor-leaderboard/sponsor-leaderboard.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SponsorInfoDTO } from 'src/app/demo/models/sponsor-info';



@Component({
  selector: 'app-sponsor-leaderboard',
  templateUrl: './sponsor-leaderboard.component.html',
  styleUrls: ['./sponsor-leaderboard.component.scss']
})
export class SponsorLeaderboardComponent implements OnInit {
  topSponsors: SponsorInfoDTO[] = [];
  loading = true;
  error = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchTopSponsors();
  }

  fetchTopSponsors(): void {
    this.loading = true;
    this.http.get<SponsorInfoDTO[]>('http://localhost:9100/sponsor-reward/top-sponsors')
      .subscribe({
        next: (data) => {
          // Construct full URL for images
          this.topSponsors = data.map(sponsor => ({
            ...sponsor,
            companyLogo: sponsor.companyLogo 
              ? `http://localhost:9100/upload/files/${sponsor.companyLogo}` 
              : 'assets/default-logo.png' // Fallback image
          }));
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching top sponsors:', err);
          this.error = true;
          this.loading = false;
        }
      });
  }
  

  getBadgeClass(badge: string): string {
    switch (badge) {
      case 'PLATINUM': return 'badge-platinum';
      case 'GOLD': return 'badge-gold';
      case 'SILVER': return 'badge-silver';
      default: return 'badge-bronze';
    }
  }

  getRankClass(index: number): string {
    switch (index) {
      case 0: return 'rank-first';
      case 1: return 'rank-second';
      case 2: return 'rank-third';
      default: return '';
    }
  }
}