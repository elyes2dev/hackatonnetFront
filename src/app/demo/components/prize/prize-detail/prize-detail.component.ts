import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationStatus } from 'src/app/demo/models/application-status';
import { Prize } from 'src/app/demo/models/prize';
import { PrizeService } from 'src/app/demo/services/prize.service';
import { ConfirmationService, MessageService } from 'primeng/api'; // Import these services

@Component({
  selector: 'app-prize-detail',
  templateUrl: './prize-detail.component.html',
  styleUrls: ['./prize-detail.component.scss']
})
export class PrizeDetailComponent implements OnInit {
  prize: Prize | null = null;
  loading = true;
  error = '';
  
  // For Admin Actions
  isAdmin = true; // Since we're not using auth, we'll assume admin access

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private prizeService: PrizeService,
    private confirmationService: ConfirmationService, // Add these services
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadPrize();
  }

  loadPrize(): void {
    this.loading = true;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (isNaN(id)) {
      this.error = 'Invalid prize ID';
      this.loading = false;
      return;
    }
    
    this.prizeService.getPrizeById(id).subscribe({
      next: (data) => {
        this.prize = data;
        console.log('Prize data:', JSON.stringify(data, null, 2));
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load prize details. Please try again later.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load prize details. Please try again later.'
        });
        console.error('Error loading prize:', error);
        this.loading = false;
      }
    });
  }

  approvePrize(): void {
    if (!this.prize?.id) return;
    
    this.loading = true;
    this.prizeService.approvePrize(this.prize.id).subscribe({
      next: (updatedPrize) => {
        this.prize = updatedPrize;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Prize #${this.prize.id} has been successfully approved.`
        });
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to approve prize. Please try again later.'
        });
        console.error('Error approving prize:', error);
      }
    });
  }

  rejectPrize(): void {
    if (!this.prize?.id) return;
    
    this.loading = true;
    this.prizeService.rejectPrize(this.prize.id).subscribe({
      next: (updatedPrize) => {
        this.prize = updatedPrize;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Prize #${this.prize.id} has been rejected.`
        });
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reject prize. Please try again later.'
        });
        console.error('Error rejecting prize:', error);
      }
    });
  }

  confirmAction(action: 'approve' | 'reject'): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} this prize?`,
      header: 'Confirm Action',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (action === 'approve') {
          this.approvePrize();
        } else {
          this.rejectPrize();
        }
      }
    });
  }

  getStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'badge bg-secondary';
    
    switch (status) {
      case ApplicationStatus.APPROVED:
        return 'badge bg-success';
      case ApplicationStatus.REJECTED:
        return 'badge bg-danger';
      case ApplicationStatus.PENDING:
        return 'badge bg-warning text-dark';
      case ApplicationStatus.CANCELED:
        return 'badge bg-secondary';
      default:
        return 'badge bg-secondary';
    }
  }

  canApproveOrReject(): boolean {
    return this.isAdmin && this.prize?.status === ApplicationStatus.PENDING;
  }

  goBack(): void {
    this.router.navigate(['/prizes']);
  }
}