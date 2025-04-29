import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { PostService } from 'src/app/demo/services/post/post.service';
import { StorageService } from 'src/app/demo/services/storage.service'; // Import StorageService
import { Post } from 'src/app/demo/models/post';
import { Comment } from 'src/app/demo/models/comment';
import { User } from 'src/app/demo/models/user.model';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnChanges {
  @Input() hackathonId?: number;
  posts: Post[] = [];
  currentUser: User | null = null;
  loading = false;
  
  editSidebarVisible = false;
  selectedPost: Post | null = null;

  constructor(
    private postService: PostService,
    private storageService: StorageService, // Inject StorageService
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hackathonId'] && this.hackathonId) {
      console.log('hackathonId changed:', this.hackathonId);
      this.loadPosts();
    }
  }

  ngOnInit(): void {
    console.log('Initializing PostListComponent with hackathonId:', this.hackathonId);
    this.loadCurrentUser();
    this.loadPosts();
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

  // post-list.component.ts
  public loadPosts(): void {
    if (this.hackathonId) {
      this.postService.getPostsByHackathon(this.hackathonId).subscribe({
        next: (posts: Post[]) => {
          console.log('Received posts:', posts);
          this.posts = posts;
        },
        error: (err) => {
          console.error('Failed to load posts', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load posts'
          });
        }
      });
    }
  }

  isPostLikedByCurrentUser(post: Post): boolean {
    if (!this.currentUser || !this.currentUser.id) return false;
    // Use type assertion to tell TypeScript we know the structure
    return !!post.likes?.some((user) => user.id === this.currentUser!.id);
  }

  onLikePost(post: Post): void {
    if (!this.currentUser || !this.currentUser.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'You must be logged in to like posts'
      });
      return;
    }
    
    if (!post.id) {
      console.error('Post ID is undefined');
      return;
    }
    
    this.postService.likePost(post.id, this.currentUser.id).subscribe({
      next: (updatedPost) => {
        const index = this.posts.findIndex(p => p.id === post.id);
        if (index !== -1) {
          this.posts[index] = {
            ...updatedPost,
            likes: updatedPost.likes || [],
            comments: updatedPost.comments || []
          };
        }
      },
      error: (err) => {
        console.error('Failed to like post', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to like post'
        });
      }
    });
  }

  onCommentAdded(post: Post, comment: Comment): void {
    const postIndex = this.posts.findIndex(p => p.id === post.id);
    if (postIndex !== -1) {
      this.posts[postIndex].comments = [
        comment,
        ...(this.posts[postIndex].comments || [])
      ];
    }
  }
 // Update the imageBaseUrl to match your backend structure
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
 

// Update your error handler as previously defined
handleImageError(event: Event, isProfilePicture = false) {
  const img = event.target as HTMLImageElement;
  
  // Prevent further error handling to avoid infinite loops
  img.onerror = null;
  
  if (isProfilePicture) {
    // Use a default avatar
    if (!img.src.includes('default-avatar.png')) {
      img.src = 'assets/images/default-avatar.png'; // Make sure this file exists!
    } else {
      // If default avatar also fails, just hide the image
      img.style.display = 'none';
    }
  } else {
    // For post images, hide the image
    img.style.display = 'none';
    
    // Add placeholder text for failed image (only if not already added)
    const parentElement = img.parentNode as HTMLElement;
    if (!parentElement.querySelector('.image-error-text')) {
      const errorSpan = document.createElement('span');
      errorSpan.innerText = 'Image unavailable';
      errorSpan.className = 'image-error-text';
      parentElement.appendChild(errorSpan);
    }
  }
}
  editPost(post: Post): void {
    // Check if user is the author of the post
    if (!this.currentUser || post.postedBy?.id !== this.currentUser.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Permission Denied',
        detail: 'You can only edit your own posts'
      });
      return;
    }
    
    this.selectedPost = {...post};
    this.editSidebarVisible = true;
  }

  closeEditSidebar(): void {
    this.editSidebarVisible = false;
    this.selectedPost = null;
  }

  onPostUpdated(): void {
    this.loadPosts();
    this.closeEditSidebar();
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Post updated successfully'
    });
  }

  confirmDelete(post: Post): void {
    // Check if user is the author of the post
    if (!this.currentUser || post.postedBy?.id !== this.currentUser.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Permission Denied',
        detail: 'You can only delete your own posts'
      });
      return;
    }
    
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this post?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deletePost(post);
      }
    });
  }

  deletePost(post: Post): void {
    this.postService.deletePost(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== post.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Post deleted successfully'
        });
      },
      error: (err) => {
        // Log detailed error information
        console.error('Failed to delete post:', err);
        console.error('Status:', err.status);
        console.error('Status text:', err.statusText);
        console.error('Error details:', err.error);

        // Display more informative error message
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to delete post: ${err.status} ${err.statusText || ''}. ${err.error?.message || ''}`
        });
      }
    });
  }

  // Helper method to check if the current user can edit/delete a post
  canManagePost(post: Post): boolean {
    return this.currentUser !== null && post.postedBy?.id === this.currentUser.id;
  }
}