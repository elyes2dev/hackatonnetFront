import { Component, OnInit } from '@angular/core';
import { WorkshopService } from '../../../services/workshop.service';
import { UserService } from '../../../services/user.service'; // Import UserService
import { User } from '../../../models/user.model'; // Import User model
import { AuthService } from 'src/app/demo/services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-workshoplist',
  templateUrl: './workshoplist.component.html',
  styleUrls: ['./workshoplist.component.scss']
})
export class WorkshoplistComponent implements OnInit {
  displayCharts: boolean = false;
  
  workshops: any[] = [];
  isLoading = true;
  isAdmin: boolean = false;
  isStudent: boolean = false;
  
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
    private authService: AuthService, // Inject UserService
    private messageService: MessageService // Inject MessageService for toast notifications
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
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to fetch workshops:', err);
        this.isLoading = false;
        // Show error notification
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch workshops'
        });
      }
    });
  }
  
  deleteWorkshop(id: number): void {
    if (confirm('Are you sure you want to delete this workshop?')) {
      this.workshopService.deleteWorkshop(id).subscribe({
        next: () => {
          this.workshops = this.workshops.filter(w => w.id !== id);
          // Show success notification instead of alert
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Workshop deleted successfully'
          });
        },
        error: (err) => {
          console.error('Deletion failed:', err);
          // Show error notification
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete workshop'
          });
        }
      });
    }
  }
  
  // Method to close the modal
  closeModal() {
    this.displayCharts = false;
  }
}