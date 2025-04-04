import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Resources } from 'src/app/demo/models/resources.model';
import { SkillEnum } from 'src/app/demo/models/skill.enum';
import { ThemeEnum } from 'src/app/demo/models/theme.enum';
import { User } from 'src/app/demo/models/user.model';
import { ResourceService } from 'src/app/demo/services/resources.service';

@Component({
  selector: 'app-resource-form',
  templateUrl: './resource-form.component.html',
  styleUrls: ['./resource-form.component.scss']
})
export class ResourceFormComponent implements OnInit {
  resourceForm!: FormGroup;
  workshopId!: number;
  resourceId!: number;
  isEditMode = false;
  selectedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private resourceService: ResourceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.workshopId = +this.route.snapshot.params['workshopId'];
    this.resourceId = +this.route.snapshot.params['resourceId'];
    this.isEditMode = !!this.resourceId;

    this.resourceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      niveau: ['', Validators.required]
    });

    if (this.isEditMode) {
      this.loadResource();
    }
  }

  loadResource(): void {
    this.resourceService.getResourceById(this.workshopId, this.resourceId).subscribe({
      next: (resource) => {
        this.resourceForm.patchValue(resource);
      },
      error: (err) => {
        console.error('Error loading resource:', err);
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  onSubmit(): void {
    if (this.resourceForm.invalid) return;

    const resourceData: Resources = this.resourceForm.value;

    if (this.isEditMode) {
      this.resourceService.updateResource(this.workshopId, this.resourceId, resourceData).subscribe({
        next: () => this.router.navigate([`/workshops/${this.workshopId}/resources`]),
        error: (err) => console.error('Error updating resource:', err)
      });
    } else {
      this.resourceService.createResource(this.workshopId, resourceData, this.selectedFiles).subscribe({
        next: () => this.router.navigate([`/workshops/${this.workshopId}/resources`]),
        error: (err) => console.error('Error creating resource:', err)
      });
    }
  }

  onCancel(): void {
    this.router.navigate([`/workshops/${this.workshopId}/resources`]);
  }
}





