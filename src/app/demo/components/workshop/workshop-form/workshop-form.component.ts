import { Component, OnInit } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeEnum } from 'src/app/demo/models/theme.enum';
import { Workshop } from 'src/app/demo/models/workshop.model';
import { WorkshopService } from 'src/app/demo/services/workshop.service';

@Component({
  selector: 'app-workshop-form',
  templateUrl: './workshop-form.component.html'
})
export class WorkshopFormComponent implements OnInit {
  themes = Object.values(ThemeEnum);
  workshopForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    photo: [''],  // This will store the Base64 or URL
    theme: [ThemeEnum.Web, Validators.required]
  });

  workshopId: number | null = null; // Holds workshop ID for edit mode
  imagePreview: string | null = null; // Preview for image

  constructor(
    private fb: FormBuilder,
    private workshopService: WorkshopService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.workshopId = +id; // Convert to number
        this.loadWorkshop(this.workshopId);
      }
    });
  }

  loadWorkshop(id: number) {
    this.workshopService.getWorkshopById(id).subscribe({
      next: (workshop: Workshop | null) => {
        if (workshop) {
          this.workshopForm.patchValue(workshop);
          this.imagePreview = workshop.photo; // Load existing image
        } else {
          console.error('Workshop not found.');
        }
      },
      error: (err) => console.error('Failed to load workshop:', err)
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.workshopForm.patchValue({ photo: base64String });
        this.imagePreview = base64String; // Show preview
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.workshopForm.valid) {
      const workshop = this.workshopForm.value as Workshop;
  
      console.log('Submitting Workshop:', workshop); // Debugging log
  
      if (this.workshopId) {
        // Update existing workshop
        this.workshopService.updateWorkshop(this.workshopId, workshop).subscribe({
          next: () => {
            console.log('Workshop updated successfully!');
            alert('Workshop updated!');
            this.router.navigate(['/workshops']); // Redirect after update
          },
          error: (err) => {
            console.error('Error updating:', err);
          }
        });
      } else {
        // Create new workshop
        this.workshopService.addWorkshop(workshop).subscribe({
          next: () => {
            console.log('Workshop added successfully!');
            alert('Workshop added!');
            this.router.navigate(['/workshops']); // Redirect after creation
          },
          error: (err) => {
            console.error('Error saving:', err);
          }
        });
      }
    } else {
      console.warn('Form is invalid:', this.workshopForm.errors);
    }
  }
  
}
