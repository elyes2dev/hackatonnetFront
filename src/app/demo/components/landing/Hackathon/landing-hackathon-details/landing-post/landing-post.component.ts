import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { PostService } from 'src/app/demo/services/post/post.service';
import { StorageService } from 'src/app/demo/services/storage.service'; // Import StorageService
import { Post } from 'src/app/demo/models/post';
import { Comment } from 'src/app/demo/models/comment';
import { User } from 'src/app/demo/models/user.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-landing-post',
  templateUrl: './landing-post.component.html',
  styleUrls: ['./landing-post.component.scss']
})
export class LandingPostComponent implements OnInit, OnChanges {
  @Input() hackathonId?: number;
  posts: Post[] = [];
  currentUser: User | null = null;
  currentUserId: number = 1; // Default user ID
  loading = false;

  constructor(
    private postService: PostService,
    private storageService: StorageService, // Inject StorageService
    private messageService: MessageService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hackathonId'] && this.hackathonId) {
      console.log('hackathonId changed:', this.hackathonId);
      this.loadPosts();
    }
  }

  ngOnInit(): void {
    console.log('Initializing LandingPostComponent with hackathonId:', this.hackathonId);
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
          if (user && user.id) {
            this.currentUserId = user.id; // Update only if user has ID
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading user:', err);
          this.loading = false;
        }
      });
    } else {
      // If no logged in user, we continue with the default value
      this.loading = false;
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
    // Fix type issue by not specifying the type in the some() callback
    return !!post.likes?.some(user => user.id === this.currentUserId);
  }

  onLikePost(post: Post): void {
    this.postService.likePost(post.id, this.currentUserId).subscribe({
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
      error: (err) => console.error('Failed to like post', err)
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

  // Image handling functionality
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

  handleImageError(event: Event, isProfilePicture: boolean = false) {
    const img = event.target as HTMLImageElement;
    
    // Prevent further error handling to avoid infinite loops
    img.onerror = null;
    
    if (isProfilePicture) {
      // Use a default avatar
      img.src = 'assets/images/default-avatar.png';
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
}