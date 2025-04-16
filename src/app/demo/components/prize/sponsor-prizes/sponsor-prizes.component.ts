import { Component, OnInit } from '@angular/core';
import { ApplicationStatus } from 'src/app/demo/models/application-status';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { Prize, PrizeType, SponsorInfoDTO } from 'src/app/demo/models/prize';
import { PrizeService } from 'src/app/demo/services/prize.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { StorageService } from 'src/app/demo/services/storage.service';

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

  PrizeType = PrizeType;
  ApplicationStatus = ApplicationStatus;

  constructor(
    private prizeService: PrizeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    const userId = this.storageService.getLoggedInUserId();
    if (!userId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Not Logged In',
        detail: 'Please log in to view your prizes.'
      });
      this.loading = false;
      return;
    }

    this.loadPrizes();
  }

  loadPrizes(): void {
    this.loading = true;
    this.prizeService.getPrizesBySponsor().subscribe({
      next: (data) => {
        this.prizes = data;
        this.loading = false;

        if (data.length > 0 && data[0].hackathon) {
          this.hackathon = data[0].hackathon;
        }

        this.loadSponsorInfo();
      },
      error: (err) => {
        this.error = 'Failed to load prizes. Please try again.';
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load prizes. Please try again.'
        });
      }
    });
  }

  loadSponsorInfo(): void {
    const userId = this.storageService.getLoggedInUserId();

    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User ID not found. Please log in again.'
      });
      return;
    }

    this.prizeService.getSponsorsByHackathon().subscribe({
      next: (sponsors) => {
        this.sponsorInfo = sponsors.find(s => s.id === userId) || null;

        if (!this.sponsorInfo) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Not Found',
            detail: 'Sponsor information not found for the logged-in user.'
          });
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load sponsor information.'
        });
      }
    });
  }

  cancelPrize(prizeId: number): void {
    const prize = this.prizes.find(p => p.id === prizeId);
    if (!prize) return;

    const now = new Date();
    if (prize.hackathon && prize.hackathon.startDate && new Date(prize.hackathon.startDate) < now) {
      this.messageService.add({
        severity: 'error',
        summary: 'Cannot Cancel',
        detail: 'Cannot cancel prize: The hackathon has already started.'
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel this prize?',
      header: 'Confirm Cancellation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.prizeService.cancelPrize(prizeId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Prize has been cancelled successfully.'
            });
            this.loadPrizes();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to cancel prize. Please try again.'
            });
          }
        });
      }
    });
  }

  getCategoryLabel(category: string): string {
    return category ? category.replace('_', ' ') : '';
  }

  isCancelDisabled(prize: Prize): boolean {
    if (prize.status === 'CANCELED' || prize.status === 'REJECTED') {
      return true;
    }

    if (prize.hackathon?.startDate) {
      const now = new Date();
      return new Date(prize.hackathon.startDate) < now;
    }

    return false;
  }
}