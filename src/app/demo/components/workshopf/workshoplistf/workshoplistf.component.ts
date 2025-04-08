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

  
  // Define columns for the table structure
  columns = [
    { field: 'id', header: 'ID' },
    { field: 'name', header: 'Name' },
    { field: 'theme', header: 'Theme' },
    { field: 'description', header: 'Description' }
  ];

  constructor(
    private workshopService: WorkshopService,
    private userService: UserService,
    private authService: AuthService // Inject UserService
  ) {}

  ngOnInit() {
    this.getAllWorkshops();
    this.getUserRole(); // Call method to fetch and log user role
    console.log(this.getUserRole)
    const userRole = this.authService.getUserRole(); // Assuming you get user role from the service
    console.log(userRole)

    if (userRole === 'admin') {
      this.isAdmin = true;
    } else if (userRole === 'student') {
      this.isStudent = true;
    }
    console.log(this.isStudent)

  }

  // Fetch and log user role
  getUserRole() {
    const userId = localStorage.getItem('loggedid'); // Assuming user ID is stored in localStorage
    console.log(userId)
    if (userId) {
      this.userService.getUserById(parseInt(userId)).subscribe({
        next: (user: User) => {
          if (user.roles && user.roles.length > 0) {
            console.log('User roles:', user.roles.map(role => role.name)); // Log roles
          } else {
            console.log('No roles found for the user');
          }
        },
        error: (err) => console.error('Error fetching user roles:', err)
      });
    } else {
      console.error('User ID not found in localStorage');
    }
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
}
