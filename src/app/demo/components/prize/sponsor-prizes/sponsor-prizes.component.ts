import { Component, OnInit } from '@angular/core';
import { ApplicationStatus } from 'src/app/demo/models/application-status';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { Prize, PrizeType, SponsorInfoDTO } from 'src/app/demo/models/prize';
import { PrizeService } from 'src/app/demo/services/prize.service';
import { ConfirmationService, MessageService } from 'primeng/api'; // Import PrimeNG services

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

  constructor(
    private prizeService: PrizeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

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
        
        // Add toast message instead of using plain error text
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load prizes. Please try again.'
        });
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
        
        // Add toast message for error
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load sponsor information.'
        });
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
      // Replace alert with PrimeNG toast
      this.messageService.add({
        severity: 'error',
        summary: 'Cannot Cancel',
        detail: 'Cannot cancel prize: The hackathon has already started.'
      });
      return;
    }

    // Replace confirm with PrimeNG confirmationService
    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel this prize?',
      header: 'Confirm Cancellation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.prizeService.cancelPrize(prizeId).subscribe({
          next: () => {
            // Show success message
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Prize has been cancelled successfully.'
            });
            // Refresh prizes list after cancellation
            this.loadPrizes();
          },
          error: (err) => {
            console.error('Error cancelling prize:', err);
            // Display the specific error message from the backend if available
            if (err.error && err.error.message) {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: err.error.message
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to cancel prize. Please try again.'
              });
            }
          }
        });
      }
    });
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