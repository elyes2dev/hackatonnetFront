import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PostService } from 'src/app/demo/services/post/post.service';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { User } from 'src/app/demo/models/user';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss'],
  providers: [MessageService]
})
export class PostFormComponent {
  @Input() hackathon: Hackathon | null = null; 
  @Output() postCreated = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  postForm: FormGroup;
  selectedFiles: File[] = [];
  currentUser: User = { id: 1, name: 'Current', lastname: 'User' }; // Replace with actual user from auth service


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
  onFileSelect(event: { files: File[] }) {
    this.selectedFiles = event.files;
  }
  
  onFileRemove(event: { file: File }) {
    this.selectedFiles = this.selectedFiles.filter(f => f.name !== event.file.name);
  }

  onSubmit() {
    if (this.postForm.valid && this.hackathon) {
      const formValue = this.postForm.value;
      
      const postData = {
        title: formValue.title,
        content: formValue.content,
        postedBy: this.currentUser,
        hackathon: this.hackathon
      };

      // Convert files to FormData if needed (backend expects MultipartFile)
      const formData = new FormData();
      formData.append('post', new Blob([JSON.stringify(postData)], { type: 'application/json' }));
      
      this.selectedFiles.forEach((file, index) => {
        formData.append(`images`, file, file.name);
      });

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
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create post: ' + err.message
          });
        }
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
}