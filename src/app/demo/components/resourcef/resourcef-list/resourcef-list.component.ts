import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ImageModel } from 'src/app/demo/models/image.model';
import { Resources } from 'src/app/demo/models/resources.model';
import { ImageService } from 'src/app/demo/services/image.service';
import { ResourceService } from 'src/app/demo/services/resources.service';
import { UserService } from 'src/app/demo/services/user.service';
import { WorkshopService } from 'src/app/demo/services/workshop.service';

@Component({
  selector: 'app-resourcef-list',
  templateUrl: './resourcef-list.component.html',
  styleUrls: ['./resourcef-list.component.scss']
})
export class ResourcefListComponent implements OnInit {
  workshopId: number = 0;
  resources: Resources[] = [];
  loading = true;
  error: string | null = null;
  filePreviews: { 
    [resourceId: number]: {
      images: { id: number, url: SafeUrl, path: string, type: string }[],
      pdfs: ImageModel[],
      otherFiles: ImageModel[]
    }
  } = {};

  userIsOwner: boolean = false; // To check if the current user is the owner


  userId: string | null = localStorage.getItem('loggedid'); // Get user ID from localStorage
  workshopOwnerId: string = ''; // Initialize the workshop owner's ID

  // To track the visibility of files for each resource
  fileVisibility: Map<number, boolean> = new Map();
  
  // Preview modal variables
  showPreview: boolean = false;
  previewUrl: SafeUrl | SafeResourceUrl | null = null;
  previewType: 'image' | 'pdf' | null = null;
  currentFile: ImageModel | null = null;

  constructor(
    private route: ActivatedRoute,
    private resourceService: ResourceService,
    private imageService: ImageService,
    private sanitizer: DomSanitizer,
    private userService: UserService,
    private workshopService: WorkshopService
  ) { }

  ngOnInit(): void {
    this.workshopId = +this.route.snapshot.params['workshopId'];
    this.loadResources();
    this.checkIfUserIsOwner(); // Check if the user is the owner of the workshop
  } 

  

  loadResources(): void {
    this.loading = true;
    this.error = null;
    
    this.resourceService.getAllWorkshopResources(this.workshopId).subscribe({
      next: (resources) => {
        this.resources = resources;
        
        // Initialize all resources with closed file sections
        resources.forEach(resource => {
          this.fileVisibility.set(resource.id, false);
          // Initialize filePreviews for each resource
          this.filePreviews[resource.id] = {
            images: [],
            pdfs: [],
            otherFiles: []
          };
        });
        
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
        // Ensure filePreviews is initialized for this resource
        if (!this.filePreviews[resource.id]) {
          this.filePreviews[resource.id] = {
            images: [],
            pdfs: [],
            otherFiles: []
          };
        }

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
        // Ensure filePreviews is initialized
        if (!this.filePreviews[resourceId]) {
          this.filePreviews[resourceId] = {
            images: [],
            pdfs: [],
            otherFiles: []
          };
        }
        this.filePreviews[resourceId].images.push({
          id: file.id_image,
          url: this.sanitizer.bypassSecurityTrustUrl(url),
          path: file.path,
          type: file.type
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

  previewFile(file: any, type: 'image' | 'pdf'): void {
    this.currentFile = file;
    this.previewType = type;
    
    if (type === 'image') {
      // For images, we already have the URL
      this.previewUrl = file.url;
      this.showPreview = true;
    } else if (type === 'pdf') {
      // For PDFs, we need to fetch and create a URL
      this.imageService.getImage(file.id_image).subscribe(blob => {
        const fileURL = URL.createObjectURL(blob);
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
        this.showPreview = true;
      });
    }
  }
  
  downloadFile(file: ImageModel): void {
    this.imageService.getImage(file.id_image).subscribe(blob => {
      const fileURL = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileURL;
      a.download = file.path || 'download'; // Default filename is 'download' if none is provided
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }
  
  downloadCurrentFile(): void {
    if (this.currentFile) {
      this.downloadFile(this.currentFile);
    }
  }
  
  closePreview(event?: MouseEvent): void {
    // Only close if clicking on the background, not the content
    if (event && event.target !== event.currentTarget) {
      return;
    }
    
    this.showPreview = false;
    this.previewUrl = null;
    this.previewType = null;
    this.currentFile = null;
  }

  viewFile(file: ImageModel): void {
    if (this.isPdfFile(file.type)) {
      this.previewFile(file, 'pdf');
    } else {
      this.downloadFile(file);
    }
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
          this.fileVisibility.delete(resourceId);
        },
        error: (err) => {
          console.error('Error deleting resource:', err);
          alert('Failed to delete resource');
        }
      });
    }
  }

  getSkillClass(niveau: string): string {
    switch (niveau.toLowerCase()) {
      case 'beginner': return 'skill-beginner';
      case 'intermediate': return 'skill-intermediate';
      case 'advanced': return 'skill-advanced';
      case 'expert': return 'skill-expert';
      default: return 'bg-gray-400';
    }
  }

  // Toggle files section for a specific resource
  toggleFiles(resourceId: number): void {
    const currentState = this.fileVisibility.get(resourceId) || false;
    this.fileVisibility.set(resourceId, !currentState);
  }

  isFilesOpen(resourceId: number): boolean {
    return !!this.fileVisibility.get(resourceId);
  }


  // Fetch the logged-in user ID and compare with the owner of the workshop
  checkIfUserIsOwner(): void {
    const loggedUserId = localStorage.getItem('loggedid') ? parseInt(localStorage.getItem('loggedid')!, 10) : null;
  
    if (loggedUserId !== null && this.workshopId) {
      this.workshopService.getWorkshopById(this.workshopId).subscribe({
        next: (workshop) => {
          this.userIsOwner = (workshop?.user?.id === loggedUserId); // Set the userIsOwner based on the comparison
        }
      });
    }
}

  // Add this method to handle file names
  getFileName(file: any): string {
    if (!file) return '';
    return file.path || file.name || 'Untitled';
  }

  // Helper method to check if files exist for a resource
  hasFiles(resourceId: number, fileType: 'images' | 'pdfs' | 'otherFiles'): boolean {
    return !!this.filePreviews[resourceId]?.[fileType]?.length;
  }

  // Helper method to safely get files for a resource
  getFiles(resourceId: number, fileType: 'images' | 'pdfs' | 'otherFiles'): any[] {
    return this.filePreviews[resourceId]?.[fileType] || [];
  }

}