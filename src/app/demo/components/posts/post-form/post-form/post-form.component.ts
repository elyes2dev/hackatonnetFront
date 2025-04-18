import { Component, EventEmitter, Output, Input, Pipe, PipeTransform } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PostService } from 'src/app/demo/services/post/post.service';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { User } from 'src/app/demo/models/user';
import { Post } from 'src/app/demo/models/post';


@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss'],
  providers: [MessageService]
})
export class PostFormComponent {
  @Input() hackathon: Hackathon | null = null;
  @Input() isEditMode: boolean = false;
  @Input() postToEdit: Post | null = null;
  @Output() postCreated = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();



  postForm: FormGroup;
  selectedFiles: File[] = [];
  currentUser: User = { id: 1, name: 'tasnim', lastname: 'omrani', email: 'tasnimomrani@gmail.com' }; // Replace with actual user from auth service


  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private messageService: MessageService
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
  }

  onFileSelect(event: any) {
    // Convert FileList to array if needed
    if (event.files instanceof FileList) {
      this.selectedFiles = Array.from(event.files);
    } else if (Array.isArray(event.files)) {
      this.selectedFiles = event.files;
    } else {
      this.selectedFiles = [event.files];
    }
  }

  onFileRemove(event: any) {
    this.selectedFiles = this.selectedFiles.filter(f => f.name !== event.file.name);
  }

  onSubmit() {
    if (this.postForm.valid && this.hackathon && this.currentUser) {
      const formData = new FormData();

      // Create a simplified post object with only IDs for relationships
      const postData = {
        title: this.postForm.value.title,
        content: this.postForm.value.content,
        postedBy: this.currentUser.id, // Just send the ID
        hackathon: this.hackathon.id   // Just send the ID
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


}
