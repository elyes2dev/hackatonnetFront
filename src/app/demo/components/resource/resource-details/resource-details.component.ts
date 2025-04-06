import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceService } from 'src/app/demo/services/resources.service';
import { ImageService } from 'src/app/demo/services/image.service';
import { Resources } from 'src/app/demo/models/resources.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-resource-details',
  templateUrl: './resource-details.component.html',
  styleUrls: ['./resource-details.component.scss']
})
export class ResourceDetailsComponent implements OnInit, OnDestroy {
  workshopId!: number;
  resourceId!: number;
  resource!: Resources;
  loading = true;
  error: string | null = null;
  imageUrls: { [key: number]: SafeUrl } = {};
  pdfFiles: any[] = [];
  otherFiles: any[] = [];
  private subscriptions = new Subscription();

  selectedImageUrl: SafeUrl | null = null; // For modal image

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resourceService: ResourceService,
    private imageService: ImageService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.workshopId = +this.route.snapshot.params['workshopId'];
    this.resourceId = +this.route.snapshot.params['resourceId'];
    this.loadResource();
  }

  loadResource(): void {
    this.loading = true;
    this.error = null;

    this.subscriptions.add(
      this.resourceService.getResourceById(this.workshopId, this.resourceId).subscribe({
        next: (resource) => {
          this.resource = resource;
          this.categorizeFiles();
          this.loadImages();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load resource';
          this.loading = false;
          console.error('Error loading resource:', err);
        }
      })
    );
  }

  categorizeFiles(): void {
    this.pdfFiles = [];
    this.otherFiles = [];
    if (this.resource?.resourceImages) {
      this.resource.resourceImages.forEach(file => {
        if (file.type.includes('pdf')) {
          this.pdfFiles.push(file);  // PDFs are added to pdfFiles
        } else if (!file.type.startsWith('image/')) {
          this.otherFiles.push(file); // Other types of files are categorized as "other"
        }
      });
    }
  }

  loadImages(): void {
    if (this.resource?.resourceImages) {
      this.resource.resourceImages.forEach(file => {
        if (file.type.startsWith('image/')) {
          this.loadImage(file.id_image);
        }
      });
    }
  }

  loadImage(imageId: number): void {
    this.subscriptions.add(
      this.imageService.getImage(imageId).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          this.imageUrls[imageId] = this.sanitizer.bypassSecurityTrustUrl(url);
        },
        error: (err) => {
          console.error('Error loading image:', err);
        }
      })
    );
  }

  openImage(imageId: number): void {
    this.selectedImageUrl = this.imageUrls[imageId] || null;
  }

  closeImage(): void {
    this.selectedImageUrl = null;
  }

  // Download Image (new method)
  downloadImage(imageId: number, fileName: string = 'downloaded-image'): void {
    this.subscriptions.add(
      this.imageService.getImage(imageId).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName + '.jpg'; // Default to .jpg
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Error downloading image:', err);
        }
      })
    );
  }

  viewPdf(file: any): void {
    this.subscriptions.add(
      this.imageService.getImage(file.id_image).subscribe(blob => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      })
    );
  }

  downloadFile(file: any): void {
    this.subscriptions.add(
      this.imageService.getImage(file.id_image).subscribe(blob => {
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = file.path || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
    );
  }

  goBack(): void {
    this.router.navigate(['/workshops', this.workshopId, 'resources']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getSkillLevelClass(level: string): string {
    return level === 'Beginner' ? 'beginner' : level === 'Intermediate' ? 'intermediate' : 'advanced';
  }

  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) {
      return 'fas fa-file-pdf text-red-500'; // PDF icon
    } else if (fileType.includes('image')) {
      return 'fas fa-file-image text-blue-500'; // Image file icon
    } else if (fileType.includes('zip') || fileType.includes('rar')) {
      return 'fas fa-file-archive text-yellow-500'; // Archive file icon
    } else if (fileType.includes('word') || fileType.includes('msword')) {
      return 'fas fa-file-word text-blue-600'; // Word file icon
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return 'fas fa-file-excel text-green-600'; // Excel file icon
    } else {
      return 'fas fa-file text-gray-500'; // Generic file icon
    }
  }
}
