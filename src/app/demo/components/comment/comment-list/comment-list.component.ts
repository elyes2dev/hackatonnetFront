import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { PostService } from 'src/app/demo/services/post/post.service';
import { StorageService } from 'src/app/demo/services/storage.service'; // Import the StorageService
import { Post } from 'src/app/demo/models/post';
import { Comment } from 'src/app/demo/models/comment';
import { User } from 'src/app/demo/models/user.model';
import { MessageService } from 'primeng/api'; // Import for showing messages

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss'],
  providers: [MessageService] // Add MessageService to providers
})
export class CommentListComponent implements OnInit {
  @Input() post!: Post;
  @Output() commentAdded = new EventEmitter<Comment>();
  
  newCommentText = '';
  showAllComments = false;
  currentUser: User | null = null;
  loading = false;

  constructor(
    private postService: PostService,
    private storageService: StorageService, // Inject the StorageService
    private messageService: MessageService // Inject the MessageService
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
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User not logged in'
      });
    }
  }

  get visibleComments(): Comment[] {
    return this.showAllComments 
      ? this.post.comments 
      : this.post.comments.slice(0, 2);
  }

  addComment(): void {
    if (!this.newCommentText.trim() || !this.currentUser) return;
  
    const newCommentPayload = {
      userId: this.currentUser.id, // Use the current user's ID from the loaded user object
      content: this.newCommentText
    };
  
    this.postService.createComment(this.post.id, newCommentPayload).subscribe({
      next: (comment: Comment) => {
        this.newCommentText = '';
        this.post.comments = [comment, ...this.post.comments];
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
          this.post.comments = this.post.comments.filter(c => c.id !== commentToDelete.id);
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
}