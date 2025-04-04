import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Resources } from 'src/app/demo/models/resources.model';
import { ImageService } from 'src/app/demo/services/image.service';
import { ResourceService } from 'src/app/demo/services/resources.service';

@Component({
  selector: 'app-resource-list',
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss']
})
export class ResourceListComponent implements OnInit {
  workshopId: number = 0;
  resources: Resources[] = [];
  loading = true;
  error: string | null = null;
  imageUrls: { [key: number]: SafeUrl } = {};

  constructor(
    private route: ActivatedRoute,
    private resourceService: ResourceService,
    private imageService: ImageService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.workshopId = +this.route.snapshot.params['workshopId'];
    this.loadResources();
  }

  loadResources(): void {
    this.loading = true;
    this.error = null;
    
    this.resourceService.getAllWorkshopResources(this.workshopId).subscribe({
      next: (resources) => {
        this.resources = resources;
        this.loadImagesForResources();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load resources';
        this.loading = false;
        console.error('Error loading resources:', err);
      }
    });
  }

  loadImagesForResources(): void {
    this.resources.forEach(resource => {
      if (resource.resourceImages && resource.resourceImages.length > 0) {
        const firstImage = resource.resourceImages[0];
        this.loadImage(firstImage.id_image, resource.id);
      }
    });
  }

  loadImage(imageId: number, resourceId: number): void {
    this.imageService.getImage(imageId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.imageUrls[resourceId] = this.sanitizer.bypassSecurityTrustUrl(url);
      },
      error: (err) => {
        console.error('Error loading image:', err);
      }
    });
  }

  deleteResource(resourceId: number): void {
    if (confirm('Are you sure you want to delete this resource?')) {
      this.resourceService.deleteResource(this.workshopId, resourceId).subscribe({
        next: () => {
          this.resources = this.resources.filter(r => r.id !== resourceId);
        },
        error: (err) => {
          console.error('Error deleting resource:', err);
          alert('Failed to delete resource');
        }
      });
    }
  }
}