import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ImageModel } from 'src/app/demo/models/image.model';
import { Resources } from 'src/app/demo/models/resources.model';
import { ImageService } from 'src/app/demo/services/image.service';
import { ResourceService } from 'src/app/demo/services/resources.service';

@Component({
  selector: 'app-resource-list',
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss']
})
export class ResourceListComponent implements OnInit {
  workshopId = 0;
  resources: Resources[] = [];
  loading = true;
  error: string | null = null;
  filePreviews: Record<number, {
      images: { id: number, url: SafeUrl }[],
      pdfs: ImageModel[],
      otherFiles: ImageModel[]
    }> = {};

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
        // Update resources in a way that avoids flicker
        this.resources = resources;
        this.loadFilesForResources();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load resources';
        this.loading = false;
        console.error('Error loading resources:', err);
      }
    });
  }

  loadFilesForResources(): void {
    this.resources.forEach(resource => {
      if (resource.resourceImages && resource.resourceImages.length > 0) {
        this.filePreviews[resource.id] = {
          images: [],
          pdfs: [],
          otherFiles: []
        };

        resource.resourceImages.forEach(file => {
          if (this.isImageFile(file.type)) {
            this.loadImage(file, resource.id);
          } else if (this.isPdfFile(file.type)) {
            this.filePreviews[resource.id].pdfs.push(file);
          } else {
            this.filePreviews[resource.id].otherFiles.push(file);
          }
        });
      }
    });
  }

  loadImage(file: ImageModel, resourceId: number): void {
    this.imageService.getImage(file.id_image).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.filePreviews[resourceId].images.push({
          id: file.id_image,
          url: this.sanitizer.bypassSecurityTrustUrl(url)
        });
      },
      error: (err) => {
        console.error('Error loading image:', err);
      }
    });
  }

  isImageFile(type: string): boolean {
    return type.startsWith('image/');
  }

  isPdfFile(type: string): boolean {
    return type === 'application/pdf';
  }

  viewFile(file: ImageModel): void {
    this.imageService.getImage(file.id_image).subscribe(blob => {
      const fileURL = URL.createObjectURL(blob);
      
      if (this.isPdfFile(file.type)) {
        // Open PDF in new tab
        window.open(fileURL, '_blank');
      } else {
        // For other files, let browser handle it
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = file.path || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  }

  getFileIcon(type: string): string {
    if (this.isPdfFile(type)) return 'pi-file-pdf';
    if (this.isImageFile(type)) return 'pi-image';
    if (type.includes('word')) return 'pi-file-word';
    if (type.includes('excel')) return 'pi-file-excel';
    if (type.includes('powerpoint')) return 'pi-file-powerpoint';
    if (type.includes('zip')) return 'pi-file-archive';
    return 'pi-file';
  }

  deleteResource(resourceId: number): void {
    if (confirm('Are you sure you want to delete this resource?')) {
      this.resourceService.deleteResource(this.workshopId, resourceId).subscribe({
        next: () => {
          this.resources = this.resources.filter(r => r.id !== resourceId);
          delete this.filePreviews[resourceId];
        },
        error: (err) => {
          console.error('Error deleting resource:', err);
          alert('Failed to delete resource');
        }
      });
    }
  }

  // Handle the global filter
  onGlobalFilter(event: any): void {
    const query = event.target.value.toLowerCase();
    
    if (query === '') {
      this.loadResources();  // Reload all resources when query is empty
    } else {
      this.resources = this.resources.filter(resource =>
        resource.name.toLowerCase().includes(query)
      );
    }
  }

  // Clear search and reset resources smoothly
  clear(dt: any): void {
    dt.clear();  // Clear the table filters
    this.loading = true;  // Set loading state to true to prevent flicker
    this.resources = [];  // Temporarily empty resources
    this.loadResources();  // Reload resources after a short delay for smooth transition
  }
}
