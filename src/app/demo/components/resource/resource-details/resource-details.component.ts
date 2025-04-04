import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Resources } from 'src/app/demo/models/resources.model';
import { ResourcesService } from 'src/app/demo/services/resources.service';

@Component({
  selector: 'app-resource-details',
  templateUrl: './resource-details.component.html',
  styleUrls: ['./resource-details.component.scss']
})
export class ResourceDetailsComponent implements OnInit {
  resource: any;  // Adjust according to your resource model
  loading: boolean = false;
  errorMessage: string = '';
  workshopId: number | null = null;
  resourceId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private resourceService: ResourcesService // Adjust path as needed
  ) {}

  ngOnInit(): void {
    // Safely handle route parameters using optional chaining
    this.workshopId = +this.route.snapshot.paramMap.get('workshopId')!;
    this.resourceId = +this.route.snapshot.paramMap.get('resourceId')!;

    if (this.workshopId && this.resourceId) {
      this.loadResourceDetails();
    }
  }

  loadResourceDetails(): void {
    this.loading = true;
    this.resourceService.getResource(this.workshopId!, this.resourceId!).subscribe({
      next: (data) => {
        this.resource = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching resource details:', err);
        this.errorMessage = 'Error fetching resource details.';
        this.loading = false;
      }
    });
  }

    // Example delete method (you may implement the logic as needed)
    deleteResource(): void {
      if (this.resourceId && this.workshopId) {
        this.resourceService.deleteResource(this.workshopId, this.resourceId).subscribe({
          next: () => {
            console.log('Resource deleted successfully');
            // Redirect or handle success
          },
          error: (err) => {
            console.error('Error deleting resource:', err);
          }
        });
      }
    }
}