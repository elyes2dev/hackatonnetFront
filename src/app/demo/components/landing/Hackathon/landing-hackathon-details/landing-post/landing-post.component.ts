import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { PostService } from 'src/app/demo/services/post/post.service';
import { Post } from 'src/app/demo/models/post';
import { Comment }  from 'src/app/demo/models/comment';
import { User } from 'src/app/demo/models/user';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-landing-post',
  templateUrl: './landing-post.component.html',
  styleUrls: ['./landing-post.component.scss']
})
export class LandingPostComponent {
  @Input() hackathonId?: number;
  posts: Post[] = [];
currentUserId = 1; // À remplacer par le service d'authentification
currentUser: User = { // Ajout de l'objet currentUser complet
  id: 1,
  name: 'tasnim',
  lastname: 'omrani',
  picture: 'https://media.istockphoto.com/id/1389823037/vector/young-smiling-woman-mia-avatar-3d-vector-people-character-illustration-cartoon-minimal-style.jpg?s=612x612&w=0&k=20&c=ciwsDqBIy3mcTxhWN4I1S-kKSTvjoN1einMrQawNZDQ=',
  email: 'tasnimomrani@gmail.com'
};

constructor(private postService: PostService,  private confirmationService: ConfirmationService,  private messageService: MessageService) {}


ngOnChanges(changes: SimpleChanges): void {
  if (changes['hackathonId'] && this.hackathonId) {
    console.log('hackathonId changed:', this.hackathonId);
    this.loadPosts();
  }}

ngOnInit(): void {
  console.log('Initializing PostListComponent with hackathonId:', this.hackathonId);
  this.loadPosts();
}

// post-list.component.ts
public loadPosts(): void {
  if (this.hackathonId) {
    this.postService.getPostsByHackathon(this.hackathonId).subscribe({
      next: (posts: Post[]) => {
        console.log('Received posts:', posts);
        this.posts = posts;
      },
      error: (err) => console.error('Failed to load posts', err)
    });
  }
}


isPostLikedByCurrentUser(post: Post): boolean {
  return !!post.likes?.some((user: User) => user.id === this.currentUserId);
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

handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = 'https://getillustrations.b-cdn.net//photos/pack/3d-avatar-male_lg.png';
  img.onerror = null;
}


}
