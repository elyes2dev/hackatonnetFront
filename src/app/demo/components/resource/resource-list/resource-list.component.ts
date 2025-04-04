import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Resources } from 'src/app/demo/models/resources.model';
import { ResourcesService } from 'src/app/demo/services/resources.service';

@Component({
  selector: 'app-resource-list',
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss']
})
export class ResourceListComponent implements OnInit {
  resources: Resources[] = [];
  workshopId!: number;  // Ensures that the workshopId is set when the component loads
  isLoading: boolean = false;  // Loading state for UI
  errorMessage: string = '';    // To store error messages

  constructor(
    private route: ActivatedRoute,
    private resourcesService: ResourcesService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const workshopIdParam = params.get('workshopId');
      console.log('Workshop ID from route:', workshopIdParam);
  
      if (workshopIdParam) {
        this.workshopId = +workshopIdParam;
        this.fetchResources();
      } else {
        console.error('workshopId is null or undefined');
      }
    });
  }
  
  fetchResources(): void {
    this.isLoading = true;
    
    this.resourcesService.getAllResources(this.workshopId).subscribe({
      next: (data) => {
        console.log('Fetched Resources:', data);
        this.resources = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Error fetching resources. Please try again later.';
        console.error('Error fetching resources:', err);
      }
    });
  }
  
  // Delete a resource by its ID
  deleteResource(resourceId: number): void {
    if (confirm('Are you sure you want to delete this resource?')) {
      this.resourcesService.deleteResource(this.workshopId, resourceId).subscribe({
        next: () => {
          // After successful deletion, remove the resource from the list
          this.resources = this.resources.filter((resource) => resource.id !== resourceId);
        },
        error: (err) => {
          console.error('Error deleting resource:', err);
        }
      });
    }
  }
}