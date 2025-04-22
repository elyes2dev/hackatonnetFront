import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Resources } from 'src/app/demo/models/resources.model';
import { SkillEnum } from 'src/app/demo/models/skill.enum';
import { ResourceService } from 'src/app/demo/services/resources.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-resourcef-form',
  templateUrl: './resourcef-form.component.html',
  styleUrls: ['./resourcef-form.component.scss']
})
export class ResourcefFormComponent implements OnInit {
  resourceForm: FormGroup;
  workshopId!: number;
  resourceId!: number;
  isEditMode = false;
  selectedFiles: File[] = [];
  existingFiles: any[] = [];
  skillLevels = Object.values(SkillEnum);
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private resourceService: ResourceService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    this.resourceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      niveau: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.workshopId = +this.route.snapshot.params['workshopId'];
    this.resourceId = +this.route.snapshot.params['resourceId'];
    this.isEditMode = !!this.resourceId;

    if (this.isEditMode) {
      this.loadResource();
    }
  }

  loadResource(): void {
    this.resourceService.getResourceById(this.workshopId, this.resourceId).subscribe({
      next: (resource) => {
        this.resourceForm.patchValue({
          name: resource.name,
          description: resource.description,
          niveau: resource.niveau
        });
        
        if (resource.resourceImages) {
          this.existingFiles = resource.resourceImages.map(file => ({
            ...file,
            isExisting: true
          }));
        }
      },
      error: (err) => {
        console.error('Error loading resource:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load resource details'
        });
      }
    });
  }

  onFileSelected(event: any): void {
    const files: File[] = Array.from(event.target.files);
    const validFiles = files.filter(file => this.isValidFile(file));
    
    if (validFiles.length !== files.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Files',
        detail: 'Some files were skipped due to unsupported format or size'
      });
    }

    this.selectedFiles = [...this.selectedFiles, ...validFiles];
    event.target.value = '';
  }

  isValidFile(file: File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ['image/', 'application/pdf', 'application/msword', 'application/vnd.ms-excel'];
    
    if (file.size > maxSize) {
      return false;
    }

    return validTypes.some(type => file.type.startsWith(type));
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  removeExistingFile(index: number): void {
    const fileToRemove = this.existingFiles[index];
    
    this.resourceService.removeImage(this.workshopId, fileToRemove.id_image).subscribe({
      next: () => {
        this.existingFiles.splice(index, 1);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'File removed successfully'
        });
      },
      error: (err) => {
        console.error('Error deleting file:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to remove file'
        });
      }
    });
  }

  onSubmit(): void {
    if (this.resourceForm.invalid) return;

    const resourceData: Resources = this.resourceForm.value;
    this.isUploading = true;

    if (this.isEditMode) {
      this.updateResource(resourceData);
    } else {
      this.createResource(resourceData);
    }
  }

  private createResource(resourceData: Resources): void {
    this.resourceService.createResource(this.workshopId, resourceData, this.selectedFiles).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Resource created successfully'
        });
        this.router.navigate([`/workshopsf/${this.workshopId}/resources`]);
      },
      error: (err) => {
        console.error('Error creating resource:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create resource'
        });
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }

  private updateResource(resourceData: Resources): void {
    this.resourceService.updateResource(this.workshopId, this.resourceId, resourceData).subscribe({
      next: () => {
        if (this.selectedFiles.length > 0) {
          this.uploadFilesForExistingResource();
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Resource updated successfully'
          });
          this.router.navigate([`/workshopsf/${this.workshopId}/resources`]);
        }
      },
      error: (err) => {
        console.error('Error updating resource:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update resource'
        });
        this.isUploading = false;
      }
    });
  }

  private uploadFilesForExistingResource(): void {
    this.resourceService.uploadImagesToResource(this.workshopId, this.resourceId, this.selectedFiles).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Resource and files updated successfully'
        });
        this.router.navigate([`/workshopsf/${this.workshopId}/resources`]);
      },
      error: (err) => {
        console.error('Error uploading files:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to upload files'
        });
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }

  getFileIcon(type: string): string {
    if (type?.includes('pdf')) return 'pdf-icon';
    if (type?.startsWith('image/')) return 'image-icon';
    if (type?.includes('word')) return 'doc-icon';
    if (type?.includes('excel')) return 'xls-icon';
    return 'file-icon';
  }

  getFileIconClass(type: string): string {
    if (type?.includes('pdf')) return 'pi-file-pdf';
    if (type?.startsWith('image/')) return 'pi-image';
    if (type?.includes('word')) return 'pi-file-word';
    if (type?.includes('excel')) return 'pi-file-excel';
    return 'pi-file';
  }

  getFileName(path: string): string {
    if (!path) return 'Unknown file';
    return path.split('/').pop() || path;
  }

  getFileType(type: string): string {
    if (!type) return 'Unknown type';
    if (type.includes('pdf')) return 'PDF Document';
    if (type.startsWith('image/')) return 'Image';
    if (type.includes('word')) return 'Word Document';
    if (type.includes('excel')) return 'Excel Spreadsheet';
    return 'File';
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  onCancel(): void {
    this.router.navigate([`/workshopsf/${this.workshopId}/resources`]);
  }
}
