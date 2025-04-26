import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { PostService } from 'src/app/demo/services/post/post.service';
import { StorageService } from 'src/app/demo/services/storage.service';
import { Post } from 'src/app/demo/models/post';
import { Comment } from 'src/app/demo/models/comment';
import { User } from 'src/app/demo/models/user.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-landing-comment',
  templateUrl: './landing-comment.component.html',
  styleUrls: ['./landing-comment.component.scss'],
  providers: [MessageService]
})
export class LandingCommentComponent implements OnInit {
  @Input() post!: Post;
  @Input() currentUserId!: number;
  @Output() commentAdded = new EventEmitter<Comment>();
  
  newCommentText = '';
  showAllComments = false;
  currentUser: User | null = null;
  loading = false;

  constructor(
    private postService: PostService,
    private storageService: StorageService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
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
    }
  }

  get visibleComments(): Comment[] {
    return this.showAllComments 
      ? this.post.comments || []
      : (this.post.comments || []).slice(0, 2);
  }

  addComment(): void {
    if (!this.newCommentText.trim() || !this.currentUser) return;
  
    const newCommentPayload = {
      userId: this.currentUser.id,
      content: this.newCommentText
    };
  
    this.postService.createComment(this.post.id, newCommentPayload).subscribe({
      next: (comment: Comment) => {
        this.newCommentText = '';
        this.post.comments = [comment, ...(this.post.comments || [])];
        // this.commentAdded.emit(comment);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Comment added successfully'
        });
      },
      error: (err) => {
        console.error('Failed to add comment', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add comment'
        });
      }
    });
  }
  
  deleteComment(commentToDelete: Comment): void {
    // Check if the current user is the author of the comment
    if (!this.currentUser || (commentToDelete.userId !== this.currentUser.id)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Permission Denied',
        detail: 'You can only delete your own comments'
      });
      return;
    }

    if (confirm('Are you sure you want to delete this comment?')) {
      this.postService.deleteComment(commentToDelete.id!).subscribe({
        next: () => {
          this.post.comments = (this.post.comments || []).filter(c => c.id !== commentToDelete.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Comment deleted successfully'
          });
        },
        error: (err) => {
          console.error('Failed to delete comment', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete comment'
          });
        }
      });
    }
  }

  canDeleteComment(comment: Comment): boolean {
    return this.currentUser !== null && comment.userId === this.currentUser.id;
  }

  // Image handling
  imageBaseUrl = 'http://localhost:9100/';

  getImageUrl(imagePath: string | undefined | null): string {
    if (!imagePath) return '';
    
    // If already a full URL, return as-is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Remove any leading ./ or / from the path
    const cleanPath = imagePath.replace(/^\.?\//, '');
    
    // Construct the final URL
    return `${this.imageBaseUrl}${cleanPath}`;
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-avatar.png';
    img.onerror = null;
  }
}