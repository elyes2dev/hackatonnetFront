import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Resources } from 'src/app/demo/models/resources.model';
import { SkillEnum } from 'src/app/demo/models/skill.enum';
import { ResourceService } from 'src/app/demo/services/resources.service';

@Component({
  selector: 'app-resource-form',
  templateUrl: './resource-form.component.html',
  styleUrls: ['./resource-form.component.scss']
})
export class ResourceFormComponent implements OnInit {
  resourceForm: FormGroup;
  workshopId!: number;
  resourceId!: number;
  isEditMode = false;
  selectedFiles: File[] = [];
  existingFiles: any[] = []; // For edit mode
  skillLevels = Object.values(SkillEnum); // Get enum values

  constructor(
    private fb: FormBuilder,
    private resourceService: ResourceService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resourceForm = this.fb.group({
      name: ['', Validators.required],
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
        this.resourceForm.patchValue(resource);
        if (resource.resourceImages) {
          this.existingFiles = resource.resourceImages.map(file => ({
            ...file,
            isExisting: true
          }));
        }
      },
      error: (err) => {
        console.error('Error loading resource:', err);
      }
    });
  }

  onFileSelected(event: any): void {
    const files: File[] = Array.from(event.target.files);
    this.selectedFiles = [...this.selectedFiles, ...files];
    event.target.value = ''; // Reset input to allow selecting same files again
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  removeExistingFile(index: number): void {
    this.existingFiles.splice(index, 1);
  }

  onSubmit(): void {
    if (this.resourceForm.invalid) return;

    const resourceData: Resources = this.resourceForm.value;

    if (this.isEditMode) {
      this.updateResource(resourceData);
    } else {
      this.createResource(resourceData);
    }
  }

  private createResource(resourceData: Resources): void {
    this.resourceService.createResource(this.workshopId, resourceData, this.selectedFiles).subscribe({
      next: () => this.router.navigate([`/workshops/${this.workshopId}/resources`]),
      error: (err) => console.error('Error creating resource:', err)
    });
  }

  private updateResource(resourceData: Resources): void {
    this.resourceService.updateResource(this.workshopId, this.resourceId, resourceData).subscribe({
      next: () => {
        // Handle file uploads separately if needed
        if (this.selectedFiles.length > 0) {
          this.uploadFilesForExistingResource();
        } else {
          this.router.navigate([`/workshops/${this.workshopId}/resources`]);
        }
      },
      error: (err) => console.error('Error updating resource:', err)
    });
  }

  private uploadFilesForExistingResource(): void {
    this.resourceService.uploadImagesToResource(this.workshopId, this.resourceId, this.selectedFiles).subscribe({
      next: () => this.router.navigate([`/workshops/${this.workshopId}/resources`]),
      error: (err) => console.error('Error uploading files:', err)
    });
  }

  getFileIcon(type: string): string {
    if (type.includes('pdf')) return 'pdf-icon';
    if (type.startsWith('image/')) return 'image-icon';
    return 'file-icon';
  }

  onCancel(): void {
    this.router.navigate([`/workshops/${this.workshopId}/resources`]);
  }
}