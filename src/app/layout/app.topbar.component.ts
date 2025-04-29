import { Component, ElementRef, ViewChild, OnInit, HostListener, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SponsorNotificationService } from '../demo/services/sponsor-notification.service';
import { SponsorNotification } from '../demo/models/sponsor-notification';
import { AuthService } from '../demo/services/auth.service';
import { User } from '../demo/models/user.model';
import { StorageService } from '../demo/services/storage.service';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss']
})
export class AppTopBarComponent implements OnInit, OnDestroy {
    items!: MenuItem[];
    unreadNotifications: SponsorNotification[] = [];
    showNotifications = false;
    notificationSubscription!: Subscription;

    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;
    @ViewChild('notificationMenu') notificationMenu!: ElementRef;

 
    constructor(
        public layoutService: LayoutService,
        private notificationService: SponsorNotificationService,
        private router: Router,
        private authService : AuthService,
        private storageService : StorageService
    ) {}

    userId: string | null = null;
    isAuthenticated: boolean = this.authService.isAuthenticated();
    isAdmin: boolean = false;
    isStudent: boolean = false;
    userMenuVisible: boolean = false; 
      user!: User;
      isSponsor: boolean = false;
      isMentor: boolean = false; 
  

    ngOnInit() {
        // Subscribe to notifications
        this.notificationService.unreadNotifications$.subscribe(notifications => {
            this.unreadNotifications = notifications;
        });

        // Poll for new notifications every minute
        this.notificationSubscription = timer(0, 60000).pipe(
            switchMap(() => this.notificationService.getUnreadNotifications())
        ).subscribe(notifications => {
            this.unreadNotifications = notifications;
        });
    }

    ngOnDestroy() {
        if (this.notificationSubscription) {
            this.notificationSubscription.unsubscribe();
        }
    }

    toggleNotifications(event: Event) {
        this.showNotifications = !this.showNotifications;
        event.preventDefault();
        event.stopPropagation();
    }

    handleNotificationClick(notification: SponsorNotification) {
        // Mark as read
        this.notificationService.markAsRead(notification.id).subscribe(() => {
            // Navigate to sponsor-application page
            this.router.navigate(['/sponsor-application']);
            this.showNotifications = false;
        });
    }

    hideNotifications() {
        this.showNotifications = false;
    }

    getTimeAgo(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (seconds < 60) {
            return 'just now';
        }
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        }
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        }
        
        const days = Math.floor(hours / 24);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }

    // Toggle user menu dropdown visibility
      toggleUserMenu(event: Event): void {
        event.stopPropagation();
        this.userMenuVisible = !this.userMenuVisible;
      }
      
      // Close user menu dropdown
      closeUserMenu(): void {
        this.userMenuVisible = false;
      }
      
      // Close dropdown when clicking outside
      @HostListener('document:click', ['$event'])
      onDocumentClick(event: MouseEvent): void {
        // Check if the click is outside the dropdown area
        const clickedElement = event.target as HTMLElement;
        const dropdown = document.querySelector('.user-dropdown');
        
        if (dropdown && !dropdown.contains(clickedElement)) {
          this.userMenuVisible = false;
        }
      }

      logout()
  {
      this.authService.logout();
      this.storageService.clearAll();
      window.location.reload();
      this.userMenuVisible = false;
  }
  
}