import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ThemeEnum } from 'src/app/demo/models/theme.enum';
import { Workshop } from 'src/app/demo/models/workshop.model';
import { StorageService } from 'src/app/demo/services/storage.service';
import { UserService } from 'src/app/demo/services/user.service';
import { WorkshopService } from 'src/app/demo/services/workshop.service';

interface WorkshopFormGroup {
  name: FormControl<string | null>;
  description: FormControl<string | null>;
  photo: FormControl<string | null>;
  theme: FormControl<ThemeEnum | null>;
}

@Component({
  selector: 'app-workshopf-form',
  templateUrl: './workshopf-form.component.html',
  styleUrls: ['./workshopf-form.component.scss'],
  providers: [MessageService]
})
export class WorkshopfFormComponent implements OnInit {
  themes = Object.values(ThemeEnum).map(theme => ({
    label: theme.charAt(0).toUpperCase() + theme.slice(1).toLowerCase(),
    value: theme
  }));
  workshopForm = this.fb.group<WorkshopFormGroup>({
    name: this.fb.control('', [Validators.required, Validators.minLength(3)]),
    description: this.fb.control('', [Validators.required, Validators.minLength(10)]),
    photo: this.fb.control<string | null>(null),
    theme: this.fb.control(ThemeEnum.Web, Validators.required)
  });
  workshopId: number | null = null;
  imagePreview: string | null = null;
  userId: string | null = null;
  isSubmitting = false;
  maxFileSize = 5 * 1024 * 1024; // 5MB
  currentWorkshop: Workshop | null = null;

  constructor(
    private fb: FormBuilder,
    private workshopService: WorkshopService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private userService: UserService,
    private messageService: MessageService
  ) {
    // Subscribe to form value changes
    this.workshopForm.valueChanges.subscribe(() => {
      if (this.currentWorkshop?.photo) {
        this.imagePreview = this.currentWorkshop.photo;
      }
    });
  }

  ngOnInit(): void {
    this.userId = this.storageService.getUserId();

    if (!this.userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please log in to create or edit workshops'
      });
      this.router.navigate(['/login']);
      return;
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.workshopId = +id;
        this.loadWorkshop(this.workshopId);
      }
    });

    // Subscribe to form changes for validation messages
    this.workshopForm.statusChanges.subscribe(() => {
      this.showValidationMessages();
    });
  }

  loadWorkshop(id: number): void {
    this.workshopService.getWorkshopById(id).subscribe({
      next: (workshop: Workshop | null) => {
        if (workshop) {
          this.currentWorkshop = workshop;
          this.workshopForm.patchValue({
            name: workshop.name,
            description: workshop.description,
            theme: workshop.theme,
            photo: workshop.photo
          });
          this.imagePreview = workshop.photo;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Workshop not found'
          });
          this.router.navigate(['/workshopsf']);
        }
      },
      error: (err) => {
        console.error('Failed to load workshop:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load workshop details'
        });
      }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Validate file size
      if (file.size > this.maxFileSize) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'File size should not exceed 5MB'
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please upload an image file'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.workshopForm.patchValue({ photo: base64String });
        this.imagePreview = base64String;
        if (this.currentWorkshop) {
          this.currentWorkshop.photo = base64String;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.imagePreview = null;
    this.workshopForm.patchValue({ photo: '' });
    if (this.currentWorkshop) {
      this.currentWorkshop.photo = '';
    }
  }

  onSubmit(): void {
    if (this.workshopForm.valid) {
      this.isSubmitting = true;
      const formValue = this.workshopForm.value;
      
      // Create a new workshop object with required properties
      const workshop: Partial<Workshop> = {
        id: this.currentWorkshop?.id,
        name: formValue.name || '',
        description: formValue.description || '',
        theme: formValue.theme || ThemeEnum.Web,
        photo: this.imagePreview || '',
        user: this.currentWorkshop?.user,
        resources: this.currentWorkshop?.resources || [],
        quiz: this.currentWorkshop?.quiz || null
      };

      const userId = this.userId ? parseInt(this.userId, 10) : undefined;

      if (!userId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'User ID is invalid'
        });
        this.isSubmitting = false;
        return;
      }

      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          workshop.user = user;

          // Now we can safely cast to Workshop since all required properties are set
          const finalWorkshop = workshop as Workshop;

          const operation = this.workshopId
            ? this.workshopService.updateWorkshop(this.workshopId, finalWorkshop)
            : this.workshopService.addWorkshop(finalWorkshop);

          operation.subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Workshop ${this.workshopId ? 'updated' : 'created'} successfully!`
              });
              this.router.navigate(['/workshopsf']);
            },
            error: (err) => {
              console.error('Error saving workshop:', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to save workshop'
              });
              this.isSubmitting = false;
            }
          });
        },
        error: (err) => {
          console.error('Error fetching user:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch user details'
          });
          this.isSubmitting = false;
        }
      });
    } else {
      this.showValidationMessages();
    }
  }

  private showValidationMessages(): void {
    const formControls = this.workshopForm.controls;
    Object.keys(formControls).forEach(key => {
      const control = formControls[key as keyof WorkshopFormGroup];
      if (control.invalid && (control.dirty || control.touched)) {
        let message = '';
        if (control.errors?.['required']) {
          message = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
        } else if (control.errors?.['minlength']) {
          message = `${key.charAt(0).toUpperCase() + key.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
        }
        if (message) {
          this.messageService.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: message
          });
        }
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/workshopsf']);
  }
}

