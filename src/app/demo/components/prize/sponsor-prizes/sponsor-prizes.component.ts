// src/app/components/sponsor-prizes/sponsor-prizes.component.ts
import { Component, OnInit } from '@angular/core';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { Prize, PrizeType, SponsorInfoDTO } from 'src/app/demo/models/prize';
import { PrizeService } from 'src/app/demo/services/prize.service';

@Component({
  selector: 'app-sponsor-prizes',
  templateUrl: './sponsor-prizes.component.html',
  styleUrls: ['./sponsor-prizes.component.scss']
})
export class SponsorPrizesComponent implements OnInit {
  prizes: Prize[] = [];
  hackathon: Hackathon | null = null;
  sponsorInfo: SponsorInfoDTO | null = null;
  loading = true;
  error = '';
  
  // Enum references for template usage
  PrizeType = PrizeType;

  constructor(private prizeService: PrizeService) { }

  ngOnInit(): void {
    this.loadPrizes();
  }

  loadPrizes(): void {
    this.loading = true;
    this.prizeService.getPrizesBySponsor().subscribe({
      next: (data) => {
        this.prizes = data;
        this.loading = false;
        
        // Get the hackathon from the first prize (assuming all prizes are for the same hackathon)
        if (data.length > 0 && data[0].hackathon) {
          this.hackathon = data[0].hackathon;
        }
        
        // Load sponsor info
        this.loadSponsorInfo();
      },
      error: (err) => {
        this.error = 'Failed to load prizes. Please try again.';
        this.loading = false;
        console.error('Error loading prizes:', err);
      }
    });
  }

  loadSponsorInfo(): void {
    this.prizeService.getSponsorsByHackathon().subscribe({
      next: (sponsors) => {
        // Find the sponsor that matches the current user ID (static ID 8 in the service)
        this.sponsorInfo = sponsors.find(s => s.id === 8) || null;
      },
      error: (err) => {
        console.error('Error loading sponsor info:', err);
      }
    });
  }

  cancelPrize(prizeId: number): void {
    if (confirm('Are you sure you want to cancel this prize?')) {
      this.prizeService.cancelPrize(prizeId).subscribe({
        next: () => {
          // Update the prize status in the local array
          const index = this.prizes.findIndex(p => p.id === prizeId);
          if (index !== -1) {
            // Refresh prizes list after cancellation
            this.loadPrizes();
          }
        },
        error: (err) => {
          console.error('Error cancelling prize:', err);
          alert('Failed to cancel prize. Please try again.');
        }
      });
    }
  }

  getCategoryLabel(category: string): string {
    return category.replace('_', ' ');
  }
}