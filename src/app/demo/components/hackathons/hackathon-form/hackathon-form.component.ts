import { Component, Output, EventEmitter, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { Router } from '@angular/router';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { AuthService } from 'src/app/demo/services/auth.service'; // Import AuthService

@Component({
  selector: 'app-hackathon-form',
  templateUrl: './hackathon-form.component.html',
  styleUrls: ['./hackathon-form.component.scss']
})
export class HackathonFormComponent implements OnInit {
  hackathonForm: FormGroup;
  @Input() hackathon: Hackathon | null = null;  // Input for edit mode
  @Output() hideSidebar = new EventEmitter<void>();  // Event to notify parent to hide sidebar
  
  constructor(
    private fb: FormBuilder,
    private hackathonService: HackathonService,
    private router: Router,
    private authService: AuthService // Inject existing AuthService
  ) {
    this.hackathonForm = this.buildForm();
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format for datetime-local
  }
  
  ngOnInit(): void {
    // Initialize form first
    this.hackathonForm = this.buildForm();
    
    // Then check for initial hackathon input
    if (this.hackathon) {
      const formattedData = {
        ...this.hackathon,
        startDate: this.formatDate(this.hackathon.startDate),
        endDate: this.formatDate(this.hackathon.endDate)
      };
      console.log('Initial form patch:', formattedData);
      this.hackathonForm.patchValue(formattedData);
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    console.log('Input changes:', changes);
    
    if (changes['hackathon'] && this.hackathonForm) {
      if (this.hackathon) {
        const formattedData = {
          ...this.hackathon,
          startDate: this.formatDate(this.hackathon.startDate),
          endDate: this.formatDate(this.hackathon.endDate)
        };
        console.log('Patching form with:', formattedData);
        this.hackathonForm.patchValue(formattedData);
      } else {
        this.hackathonForm.reset();
        // Reset form but maintain the user ID
        this.hackathonForm.get('createdBy.id')?.setValue(this.getUserIdFromToken());
      }
    }
  }
  
  // Helper method to extract user ID from token or localStorage
  private getUserIdFromToken(): number {
    // This implementation will depend on how your token stores user information
    // You might need to decode a JWT token or get the ID from localStorage
    
    // Option 1: If you store user ID in localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      return parseInt(userId, 10);
    }
    
    // Option 2: If you can access info from the token
    // This is just a placeholder - implement according to your token structure
    // You might need to parse a JWT token or use some other method
    
    // Default fallback to user ID 1 if we can't determine the current user
    return 1;
  }
  
  onSubmit(): void {
    if (this.hackathonForm.invalid) {
      this.hackathonForm.markAllAsTouched();
      return;
    }
    
    const formData = this.hackathonForm.value;
    console.log('Form data before submission:', formData);
    console.log('Submitting with mode:', this.hackathon ? 'EDIT' : 'CREATE');
    console.log('Current hackathon ID:', this.hackathon?.id);
    
    if (this.hackathon?.id) {
      // EDIT MODE
      console.log('Attempting to update hackathon ID:', this.hackathon.id);
      this.hackathonService.updateHackathon(this.hackathon.id, formData)
        .subscribe({
          next: () => {
            console.log('Successfully updated hackathon');
            this.hideSidebar.emit();
            console.log('Updated hackathon ID:', this.hackathon?.id);
          },
          error: (err) => {
            console.error('Update error:', err);
            alert('Failed to update hackathon');
          }
        });
        location.reload();
      
    } else {
      // CREATE MODE
      console.log('Creating new hackathon');
      this.hackathonService.createHackathon(formData)
        .subscribe({
          next: () => {
            console.log('Successfully created hackathon');
            this.hideSidebar.emit();
          },
          error: (err) => {
            console.error('Create error:', err);
            alert('Failed to create hackathon');
          }
        });
        location.reload();
    }
  }

  buildForm(): FormGroup {
    const userId = this.getUserIdFromToken();
    console.log('Building form with user ID:', userId);
    
    return this.fb.group({
      title: ['', Validators.required],
      description: [''],
      location: ['', Validators.required],
      logo: [''],
      maxMembers: [1, [Validators.required, Validators.min(1)]],
      isOnline: [false, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      createdBy: this.fb.group({
        id: [userId, Validators.required] // Dynamic user ID
      })
    });
  }
}