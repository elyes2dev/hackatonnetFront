import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationStatus } from 'src/app/demo/models/application-status';
import { Prize } from 'src/app/demo/models/prize';
import { PrizeService } from 'src/app/demo/services/prize.service';

interface Alert {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
}

@Component({
  selector: 'app-prize-detail',
  templateUrl: './prize-detail.component.html',
  styleUrls: ['./prize-detail.component.scss']
})
export class PrizeDetailComponent implements OnInit {
  prize: Prize | null = null;
  loading = true;
  error = '';
  
  // For alerts
  alerts: Alert[] = [];
  
  // For Admin Actions
  isAdmin = true; // Since we're not using auth, we'll assume admin access

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private prizeService: PrizeService
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
    
    this.prizeService.getPrizeById(id).subscribe(
      (data) => {
        this.prize = data;
        console.log('Prize data:', JSON.stringify(data, null, 2));
        this.loading = false;
      },
      (error) => {
        this.error = 'Failed to load prize details. Please try again later.';
        this.addAlert('danger', 'Failed to load prize details. Please try again later.');
        console.error('Error loading prize:', error);
        this.loading = false;
      }
    );
  }

  approvePrize(): void {
    if (!this.prize?.id) return;
    
    this.loading = true;
    this.prizeService.approvePrize(this.prize.id).subscribe(
      (updatedPrize) => {
        this.prize = updatedPrize;
        this.loading = false;
        this.addAlert('success', `Prize #${this.prize.id} has been successfully approved.`);
      },
      (error) => {
        this.loading = false;
        this.addAlert('danger', 'Failed to approve prize. Please try again later.');
        console.error('Error approving prize:', error);
      }
    );
  }

  rejectPrize(): void {
    if (!this.prize?.id) return;
    
    this.loading = true;
    this.prizeService.rejectPrize(this.prize.id).subscribe(
      (updatedPrize) => {
        this.prize = updatedPrize;
        this.loading = false;
        this.addAlert('success', `Prize #${this.prize.id} has been rejected.`);
      },
      (error) => {
        this.loading = false;
        this.addAlert('danger', 'Failed to reject prize. Please try again later.');
        console.error('Error rejecting prize:', error);
      }
    );
  }

  confirmAction(action: 'approve' | 'reject'): void {
    if (confirm(`Are you sure you want to ${action} this prize?`)) {
      if (action === 'approve') {
        this.approvePrize();
      } else {
        this.rejectPrize();
      }
    }
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
  
  // Alert methods
  addAlert(type: 'success' | 'danger' | 'warning' | 'info', message: string): void {
    this.alerts.push({ type, message });
    
    // Auto-dismiss success and info alerts after 5 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => this.dismissAlert(message), 5000);
    }
  }
  
  dismissAlert(message: string): void {
    this.alerts = this.alerts.filter(alert => alert.message !== message);
  }
}