import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Resources } from 'src/app/demo/models/resources.model';
import { SkillEnum } from 'src/app/demo/models/skill.enum';
import { ThemeEnum } from 'src/app/demo/models/theme.enum';
import { User } from 'src/app/demo/models/user.model';

@Component({
  selector: 'app-resource-form',
  templateUrl: './resource-form.component.html',
  styleUrls: ['./resource-form.component.scss']
})
export class ResourceFormComponent {
  // Default user data
  dummyUser: User = {
    id: 1,
    name: 'admin',
    lastname: 'Doe',
    email: 'admin@example.com',
    username: 'admin123',
    password: 'password123',
    birthdate: new Date('1990-01-01'),
    picture: 'profile-pic.jpg',
    description: 'Administrator',
    score: 100,
    createdAt: new Date(),
    workshops: []
  };

  // Resource with all required fields
  resource: Resources = {
    id: 0,
    name: '',
    description: '',
    niveau: SkillEnum.Beginner, // Default to beginner
    workshop: {
      id: 1,
      name: 'Workshop Name',
      description: 'Workshop Description',
      photo: 'default.jpg',
      theme: ThemeEnum.Default,
      user: this.dummyUser,
      resources: []
    },
    documents: [],
    images: []
  };

  documents: File[] = [];
  images: File[] = [];
  errorMessage: string | null = null;
  loading: boolean = false;
  skillLevels = Object.values(SkillEnum); // For dropdown

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onDocumentSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.documents = Array.from(input.files);
    }
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.images = Array.from(input.files);
    }
  }

  onSubmit(): void {
    // Validate required fields
    if (!this.resource.name || !this.resource.description) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    // Validate file types
    if (!this.validateFiles()) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const formData = this.createFormData();

    this.http.post<any>('http://localhost:9100/pi/workshops/1/resources', formData)
      .subscribe({
        next: (data) => this.handleSuccess(data),
        error: (err) => this.handleError(err)
      });
  }

  private validateFiles(): boolean {
    // Validate document types (PDF, ZIP)
    const invalidDocs = this.documents.filter(file => 
      !['application/pdf', 'application/zip'].includes(file.type)
    );
    
    // Validate image types
    const invalidImages = this.images.filter(file => 
      !file.type.startsWith('image/')
    );

    if (invalidDocs.length > 0 || invalidImages.length > 0) {
      this.errorMessage = 
        `Invalid file types. 
        Documents must be PDF/ZIP. 
        Images must be JPG/PNG.`;
      return false;
    }

    return true;
  }

  private createFormData(): FormData {
    const formData = new FormData();
    
    // Remove circular references before stringifying
    const { workshop, documents, images, ...resourceData } = this.resource;
    formData.append('resource', JSON.stringify({
      ...resourceData,
      workshopId: workshop.id
    }));

    // Add documents
    this.documents.forEach(doc => 
      formData.append('documents', doc, doc.name)
    );

    // Add images
    this.images.forEach(img => 
      formData.append('images', img, img.name)
    );

    return formData;
  }

  private handleSuccess(data: any): void {
    console.log('Resource created successfully', data);
    this.loading = false;
    this.router.navigate(['/workshops', 1, 'resources']); // Redirect to resources list
  }

  private handleError(error: HttpErrorResponse): void {
    console.error('Error creating resource:', error);
    this.loading = false;
    
    if (error.status === 400) {
      this.errorMessage = 'Invalid data format. Please check your inputs.';
    } else if (error.status === 413) {
      this.errorMessage = 'File size too large. Please upload smaller files.';
    } else {
      this.errorMessage = 'An unexpected error occurred. Please try again.';
    }
  }
}