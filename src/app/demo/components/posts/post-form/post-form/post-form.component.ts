import { Component, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PostService } from 'src/app/demo/services/post/post.service';
import { StorageService } from 'src/app/demo/services/storage.service'; // Import the StorageService
import { Hackathon } from 'src/app/demo/models/hackathon';
import { User } from 'src/app/demo/models/user.model';
import { Post } from 'src/app/demo/models/post';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss'],
  providers: [MessageService]
})
export class PostFormComponent implements OnInit, OnDestroy {
  @Input() hackathon: Hackathon | null = null;
  @Input() isEditMode = false;
  @Input() postToEdit: Post | null = null;
  @Output() postCreated = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  postForm: FormGroup;
  selectedFiles: File[] = [];
  currentUser: User | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private messageService: MessageService,
    private storageService: StorageService // Inject the StorageService
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });

    if (this.isEditMode && this.postToEdit) {
      this.postForm.patchValue({
        title: this.postToEdit.title,
        content: this.postToEdit.content
      });
    }
    
    // Get the current user from StorageService
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    this.loading = true;
    const userId = this.storageService.getLoggedInUserId();
    
    if (userId) {
      this.storageService.getUserById(userId).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading user:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load user information'
          });
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User not logged in'
      });
    }
  }

 // Add this to your component properties
previewUrls: Record<string, string> = {};

// Update the onFileSelect method
onFileSelect(event: any) {
  // Convert FileList to array if needed
  if (event.files instanceof FileList) {
    this.selectedFiles = Array.from(event.files);
  } else if (Array.isArray(event.files)) {
    this.selectedFiles = event.files;
  } else {
    this.selectedFiles = [event.files];
  }
  
  // Generate preview URLs
  this.generatePreviewUrls();
}

// Update the onFileRemove method
onFileRemove(event: any) {
  this.selectedFiles = this.selectedFiles.filter(f => f.name !== event.file.name);
  this.revokeObjectUrl(event.file.name);
  this.generatePreviewUrls();
}

// Add these new methods
private generatePreviewUrls() {
  this.previewUrls = {};
  this.selectedFiles.forEach(file => {
    if (this.isImageFile(file)) {
      this.previewUrls[file.name] = URL.createObjectURL(file);
    }
  });
}

private revokeObjectUrl(filename: string) {
  if (this.previewUrls[filename]) {
    URL.revokeObjectURL(this.previewUrls[filename]);
    delete this.previewUrls[filename];
  }
}

// Update getFilePreviewUrl to use the cached URLs
getFilePreviewUrl(file: File): string {
  return this.previewUrls[file.name] || '';
}

// Clean up URLs when component is destroyed
ngOnDestroy() {
  Object.values(this.previewUrls).forEach(url => URL.revokeObjectURL(url));
  this.previewUrls = {};
}

  onSubmit() {
    if (this.postForm.valid && this.hackathon && this.currentUser) {
      const formData = new FormData();

      // Create a simplified post object with only IDs for relationships
      const postData = {
        title: this.postForm.value.title,
        content: this.postForm.value.content,
        postedBy: this.currentUser.id, // Use the dynamically loaded user ID
        hackathon: this.hackathon.id
      };

      if (this.isEditMode && this.postToEdit) {
        // For edit mode, include the post ID
        const postToUpdate = {
          ...postData,
          id: this.postToEdit.id
        };

        const postBlob = new Blob([JSON.stringify(postToUpdate)], { type: 'application/json' });
        formData.append('post', postBlob);

        // Append files if any
        if (this.selectedFiles && this.selectedFiles.length > 0) {
          for (const file of this.selectedFiles) {
            formData.append('images', file, file.name);
          }
        }

        this.postService.updatePost(this.postToEdit.id, formData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Post updated successfully'
            });
            this.postCreated.emit();
            this.resetForm();
          },
          error: (err) => {
            console.error('Error updating post:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to update post'
            });
          }
        });
      } else {
        // For create mode
        const postBlob = new Blob([JSON.stringify(postData)], { type: 'application/json' });
        formData.append('post', postBlob);

        // Append files if any
        if (this.selectedFiles && this.selectedFiles.length > 0) {
          for (const file of this.selectedFiles) {
            formData.append('images', file, file.name);
          }
        }

        this.postService.createPost(formData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Post created successfully'
            });
            this.postCreated.emit();
            this.resetForm();
          },
          error: (err) => {
            console.error('Error creating post:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to create post'
            });
          }
        });
      }
    } else if (!this.currentUser) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User information not available'
      });
    } else if (!this.hackathon) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Hackathon information not available'
      });
    }
  }

  onCancel() {
    this.resetForm();
    this.cancel.emit();
  }

  private resetForm() {
    this.postForm.reset();
    this.selectedFiles = [];
  }

  isImageFile(file: File): boolean {
    return file.type.includes('image/');
  }
  
}