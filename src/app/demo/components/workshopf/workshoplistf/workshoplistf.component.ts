import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/demo/models/user.model';
import { AuthService } from 'src/app/demo/services/auth.service';
import { UserService } from 'src/app/demo/services/user.service';
import { WorkshopService } from 'src/app/demo/services/workshop.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
  selector: 'app-workshoplistf',
  templateUrl: './workshoplistf.component.html',
  styleUrls: ['./workshoplistf.component.scss']
})
export class WorkshoplistfComponent implements OnInit {
  workshops: any[] = [];
  isLoading = true;
  isAdmin: boolean = false;
  isStudent: boolean = false;
  searchName: string = '';
  selectedTheme: string = '';
  uniqueThemes: string[] = [];
  favorites: string[] = [];
  recentlyViewed: string[] = [];

  constructor(
    private workshopService: WorkshopService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.getAllWorkshops();
    this.getUserRole();
    this.loadFavorites();
    this.loadRecentlyViewed();
  }

  getAllWorkshops() {
    this.workshopService.getAllWorkshops().subscribe({
      next: (data: any[]) => {
        this.workshops = data;
        this.uniqueThemes = Array.from(
          new Set(data.map((w) => w.theme).filter((t) => !!t))
        );
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to fetch workshops:', err);
        this.isLoading = false;
      }
    });
  }

  getUserRole() {
    const userRole = this.authService.getUserRole(); 
    if (userRole === 'admin') {
      this.isAdmin = true;
    } else if (userRole === 'student') {
      this.isStudent = true;
    }
    const userId = localStorage.getItem('loggedid'); // Assuming user ID is stored in localStorage
    console.log('UserID from localStorage:', userId);
  }

  // Mark workshop as favorite/unfavorite
  toggleFavorite(workshopId: string) {
    const index = this.favorites.indexOf(workshopId);
    if (index === -1) {
      this.favorites.push(workshopId);
    } else {
      this.favorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  }

  // Mark a workshop as recently viewed
  viewWorkshop(workshopId: string) {
    if (!this.recentlyViewed.includes(workshopId)) {
      this.recentlyViewed.push(workshopId);
      localStorage.setItem('recentlyViewed', JSON.stringify(this.recentlyViewed));
    }
  }

  // Load favorites from localStorage
  loadFavorites() {
    const favorites = localStorage.getItem('favorites');
    this.favorites = favorites ? JSON.parse(favorites) : [];
  }

  // Load recently viewed workshops from localStorage
  loadRecentlyViewed() {
    const recentlyViewed = localStorage.getItem('recentlyViewed');
    this.recentlyViewed = recentlyViewed ? JSON.parse(recentlyViewed) : [];
  }

  // Delete workshop
  deleteWorkshop(id: number): void {
    if (confirm('Are you sure you want to delete this workshop?')) {
      this.workshopService.deleteWorkshop(id).subscribe({
        next: () => {
          this.workshops = this.workshops.filter(w => w.id !== id);
          alert('Workshop deleted successfully');
        },
        error: (err) => console.error('Deletion failed:', err)
      });
    }
  }


    // Check if the logged-in user is the owner of the workshop
    isOwner(workshopOwnerId: number): boolean {
      const userId = localStorage.getItem('loggedid');
      return userId ? parseInt(userId) === workshopOwnerId : false;
    }
}
