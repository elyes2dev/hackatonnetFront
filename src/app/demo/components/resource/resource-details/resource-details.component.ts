import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceService } from 'src/app/demo/services/resources.service';
import { ImageService } from 'src/app/demo/services/image.service';
import { Resources } from 'src/app/demo/models/resources.model';
import { DomSanitizer, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

interface FileWithUrl {
  id_image: number;
  path: string;
  type: string;
  url?: SafeUrl | SafeResourceUrl;
}

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
  
  // Organized file arrays
  imageFiles: FileWithUrl[] = [];
  pdfFiles: FileWithUrl[] = [];
  otherFiles: FileWithUrl[] = [];
  
  private subscriptions = new Subscription();

  // Modal properties
  showModal = false;
  modalType: 'image' | 'pdf' | 'other' = 'image';
  selectedFile: FileWithUrl | null = null;

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
    // Reset arrays
    this.imageFiles = [];
    this.pdfFiles = [];
    this.otherFiles = [];
    
    if (this.resource?.resourceImages) {
      this.resource.resourceImages.forEach(file => {
        const fileWithUrl: FileWithUrl = {
          id_image: file.id_image,
          path: file.path || `file-${file.id_image}`,
          type: file.type || 'application/octet-stream'
        };
        
        if (file.type?.startsWith('image/')) {
          this.imageFiles.push(fileWithUrl);
          this.loadFileContent(fileWithUrl);
        } else if (file.type?.includes('pdf')) {
          this.pdfFiles.push(fileWithUrl);
          this.loadFileContent(fileWithUrl);
        } else {
          this.otherFiles.push(fileWithUrl);
          // We'll load other file content on demand
        }
      });
    }
  }

  loadFileContent(file: FileWithUrl): void {
    this.subscriptions.add(
      this.imageService.getImage(file.id_image).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          if (file.type.startsWith('image/')) {
            file.url = this.sanitizer.bypassSecurityTrustUrl(url);
          } else if (file.type.includes('pdf')) {
            file.url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          } else {
            file.url = this.sanitizer.bypassSecurityTrustUrl(url);
          }
        },
        error: (err) => {
          console.error(`Error loading file ${file.id_image}:`, err);
        }
      })
    );
  }

  // Modal functions
  openFileModal(file: FileWithUrl, type: 'image' | 'pdf' | 'other'): void {
    this.selectedFile = file;
    this.modalType = type;
    
    // If the file hasn't been loaded yet, load it now
    if (!file.url) {
      this.loadFileContent(file);
    }
    
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedFile = null;
  }

  downloadFile(file: FileWithUrl): void {
    this.subscriptions.add(
      this.imageService.getImage(file.id_image).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.path || `file-${file.id_image}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Error downloading file:', err);
        }
      })
    );
  }

  viewPdf(file: FileWithUrl): void {
    if (file.url) {
      window.open(this.sanitizer.sanitize(4, file.url as SafeResourceUrl) || '', '_blank');
    } else {
      this.subscriptions.add(
        this.imageService.getImage(file.id_image).subscribe({
          next: (blob) => {
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
          },
          error: (err) => {
            console.error('Error viewing PDF:', err);
          }
        })
      );
    }
  }

  goBack(): void {
    this.router.navigate(['/workshops', this.workshopId, 'resources']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getSkillLevelClass(level: string): string {
    return level === 'Beginner' ? 'beginner' : level === 'Intermediate' ? 'intermediate' : 'expert';
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

  getFileName(path: string): string {
    return path.split('/').pop() || path;
  }
}