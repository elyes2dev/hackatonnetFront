import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Resources } from 'src/app/demo/models/resources.model';
import { SkillEnum } from 'src/app/demo/models/skill.enum';
import { ThemeEnum } from 'src/app/demo/models/theme.enum';
import { User } from 'src/app/demo/models/user.model';
import { ResourcesService } from 'src/app/demo/services/resources.service';

@Component({
  selector: 'app-resource-form',
  templateUrl: './resource-form.component.html',
  styleUrls: ['./resource-form.component.scss']
})
export class ResourceFormComponent implements OnInit {
  workshopId!: number;
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

  resource: Resources = {
    id: 0,
    name: '',
    description: '',
    niveau: SkillEnum.Beginner,
    workshop: {
      id: 0,
      name: '',
      description: '',
      photo: '',
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
  successMessage: string | null = null;
  loading: boolean = false;
  skillLevels = Object.values(SkillEnum);

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private resourceService: ResourcesService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('workshopId');
      if (id) {
        this.workshopId = +id;
        this.resource.workshop.id = this.workshopId;
      }
    });
  }

  onFileSelect(event: Event, type: 'document' | 'image'): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      if (type === 'document') {
        this.documents = Array.from(input.files);
      } else {
        this.images = Array.from(input.files);
      }
    }
  }

  onSubmit(): void {
    if (!this.resource.name || !this.resource.description) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
  
    if (!this.validateFiles()) {
      return;
    }
  
    this.loading = true;
    this.errorMessage = null;
  
    // Pass the required parameters directly to the service method
    this.resourceService.createResource(this.workshopId, this.resource, this.documents, this.images).subscribe({
      next: (data) => this.handleSuccess(data),
      error: (err) => this.handleError(err)
    });
  }

  private validateFiles(): boolean {
    const invalidDocs = this.documents.filter(file => 
      !['application/pdf', 'application/zip'].includes(file.type)
    );
    const invalidImages = this.images.filter(file => 
      !file.type.startsWith('image/')
    );

    if (invalidDocs.length > 0 || invalidImages.length > 0) {
      this.errorMessage = 'Invalid file types. Documents must be PDF/ZIP. Images must be JPG/PNG.';
      return false;
    }
    return true;
  }

  private createFormData(): FormData {
    const formData = new FormData();
    const { workshop, documents, images, ...resourceData } = this.resource;
    formData.append('resource', JSON.stringify({
      ...resourceData,
      workshopId: workshop.id
    }));

    this.documents.forEach(doc => formData.append('documents', doc, doc.name));
    this.images.forEach(img => formData.append('images', img, img.name));
    return formData;
  }

  private handleSuccess(data: any): void {
    console.log('Resource created successfully', data);
    this.successMessage = 'Resource was added successfully!';
    this.loading = false;
    this.router.navigate([`/workshops/${this.workshopId}/resources`]);
  }

  navigateToResources(): void {
    this.router.navigate(['/workshops', this.workshopId, 'resources']);
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

  goBack(): void {
    this.router.navigate(['/workshops', this.workshopId, 'resources']);
  }
}






