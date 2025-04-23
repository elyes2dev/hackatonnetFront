import { Component, Output, EventEmitter, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { Router } from '@angular/router';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { StorageService } from 'src/app/demo/services/storage.service'; // Import StorageService instead

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
    private storageService: StorageService // Inject StorageService instead of AuthService
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
        this.hackathonForm.get('createdBy.id')?.setValue(this.getUserIdFromStorage());
      }
    }
  }
  
  // Use StorageService to get user ID
  private getUserIdFromStorage(): number {
    const userId = this.storageService.getLoggedInUserId();
    console.log('Retrieved user ID from storage:', userId);
    return userId || 1; // Fallback to 1 if userId is null
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
    const userId = this.getUserIdFromStorage();
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
        id: [userId, Validators.required] // Dynamic user ID from StorageService
      })
    });
  }
}