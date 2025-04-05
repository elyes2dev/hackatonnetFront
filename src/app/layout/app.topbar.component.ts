import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SponsorNotificationService } from '../demo/services/sponsor-notification.service';
import { SponsorNotification } from '../demo/models/sponsor-notification';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss']
})
export class AppTopBarComponent implements OnInit {
    items!: MenuItem[];
    unreadNotifications: SponsorNotification[] = [];
    showNotifications: boolean = false;
    notificationSubscription!: Subscription;

    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;
    @ViewChild('notificationMenu') notificationMenu!: ElementRef;

    constructor(
        public layoutService: LayoutService,
        private notificationService: SponsorNotificationService,
        private router: Router
    ) {}

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
}