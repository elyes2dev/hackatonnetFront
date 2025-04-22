import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PostService } from 'src/app/demo/services/post/post.service';
import { Post } from 'src/app/demo/models/post';
import { Comment }  from 'src/app/demo/models/comment';
import { User } from 'src/app/demo/models/user';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss']
})
export class CommentListComponent {
  @Input() post!: Post;
  @Input() currentUserId!: number;
  @Output() commentAdded = new EventEmitter<Comment>();
  
  newCommentText = '';
  showAllComments = false;

  constructor(private postService: PostService) {}

  get visibleComments(): Comment[] {
    return this.showAllComments 
      ? this.post.comments 
      : this.post.comments.slice(0, 2);
  }

  addComment(): void {
    if (!this.newCommentText.trim()) return;
  
    const newCommentPayload = {
      userId: this.currentUserId,
      content: this.newCommentText
    };
  
    this.postService.createComment(this.post.id, newCommentPayload).subscribe({
      next: (comment: Comment) => {
        // this.commentAdded.emit(comment);
        this.newCommentText = '';
        this.post.comments = [comment, ...this.post.comments];
      },
      error: (err) => console.error('Failed to add comment', err)
    });
  }
  
  deleteComment(commentToDelete: Comment): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.postService.deleteComment(commentToDelete.id!).subscribe({
        next: () => {
          this.post.comments = this.post.comments.filter(c => c.id !== commentToDelete.id);
        },
        error: (err) => console.error('Failed to delete comment', err)
      });
    }
  }
  

}