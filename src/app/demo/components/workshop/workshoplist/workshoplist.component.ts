import { Component, OnInit } from '@angular/core';
import { WorkshopService } from '../../../services/workshop.service';

@Component({
  selector: 'app-workshoplist',
  templateUrl: './workshoplist.component.html',
  styleUrls: ['./workshoplist.component.scss']
})
export class WorkshoplistComponent implements OnInit {
  workshops: any[] = [];
  isLoading = true;
  
  // Define columns for the table structure
  columns = [
    { field: 'id', header: 'ID' },
    { field: 'name', header: 'Name' },
    { field: 'theme', header: 'Theme' },
    { field: 'description', header: 'Description' }
  ];

  constructor(private workshopService: WorkshopService) {}

  ngOnInit() {
    this.getAllWorkshops();
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
