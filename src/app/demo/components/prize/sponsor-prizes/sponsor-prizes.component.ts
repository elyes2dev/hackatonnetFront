import { Component, OnInit } from '@angular/core';
import { ApplicationStatus } from 'src/app/demo/models/application-status';
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
  ApplicationStatus = ApplicationStatus;

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
    // Find the prize in our local array first
    const prize = this.prizes.find(p => p.id === prizeId);
    if (!prize) return;
    
    // Check if hackathon has already started
    const now = new Date();
    if (prize.hackathon && prize.hackathon.startDate && new Date(prize.hackathon.startDate) < now) {
      alert('Cannot cancel prize: The hackathon has already started.');
      return;
    }

    if (confirm('Are you sure you want to cancel this prize?')) {
      this.prizeService.cancelPrize(prizeId).subscribe({
        next: () => {
          // Refresh prizes list after cancellation
          this.loadPrizes();
        },
        error: (err) => {
          console.error('Error cancelling prize:', err);
          // Display the specific error message from the backend if available
          if (err.error && err.error.message) {
            alert(err.error.message);
          } else {
            alert('Failed to cancel prize. Please try again.');
          }
        }
      });
    }
  }

  getCategoryLabel(category: string): string {
    return category ? category.replace('_', ' ') : '';
  }

  // Helper method to check if cancel button should be disabled
  isCancelDisabled(prize: Prize): boolean {
    // Disable if status is CANCELED or REJECTED
    if (prize.status === 'CANCELED' || prize.status === 'REJECTED') {
      return true;
    }
    
    // Disable if hackathon has already started
    if (prize.hackathon && prize.hackathon.startDate) {
      const now = new Date();
      if (new Date(prize.hackathon.startDate) < now) {
        return true;
      }
    }
    
    return false;
  }
}