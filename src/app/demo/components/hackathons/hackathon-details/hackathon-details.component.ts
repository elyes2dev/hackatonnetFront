import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { PostService } from 'src/app/demo/services/post/post.service';
import { PostFormComponent } from 'src/app/demo/components/posts/post-form/post-form/post-form.component';
import { PostListComponent } from 'src/app/demo/components/posts/post-list/post-list.component';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/demo/services/storage.service'; // Import StorageService

@Component({
  selector: 'app-hackathon-details',
  templateUrl: './hackathon-details.component.html',
  styleUrls: ['./hackathon-details.component.scss']
})
export class HackathonDetailsComponent implements OnInit {
  @ViewChild(PostListComponent) postListComponent!: PostListComponent;
  hackathon: Hackathon | null = null;
  display = false;
  displayPostForm = false;
  currentUserId: number | null = null; // Store current user ID
  isCurrentUserCreator = false; // Track if current user is the creator

  constructor(
    private route: ActivatedRoute,
    private hackathonService: HackathonService,
    private router: Router,
    private storageService: StorageService // Inject StorageService
  ) {}

  ngOnInit() {
    // Get current user ID from storage service
    this.currentUserId = this.storageService.getLoggedInUserId();
    console.log('Current user ID:', this.currentUserId);
    
    // Get the 'id' parameter from the route
    const hackathonId = this.route.snapshot.paramMap.get('id');

    if (hackathonId) {
      // Fetch the hackathon details based on the ID
      this.hackathonService.getHackathonById(hackathonId).subscribe((data: Hackathon) => {
        this.hackathon = data;
        
        // Check if current user is the creator of this hackathon
        if (this.hackathon && this.currentUserId) {
          this.isCurrentUserCreator = this.hackathon.createdBy.id === this.currentUserId;
          console.log('Is current user the creator?', this.isCurrentUserCreator);
        }
      });
    }
  }

  // Check if user can edit or delete the hackathon
  canModifyHackathon(): boolean {
    return this.isCurrentUserCreator;
  }

  showPostForm() {
    this.displayPostForm = true;
  }

  onPostCreated() {
    this.displayPostForm = false;
    this.refreshPostList();
  }

  refreshPostList() {
    if (this.postListComponent) {
      this.postListComponent.loadPosts();
    }
  }

  onPostFormCancel() {
    this.displayPostForm = false;
  }

  goToLiveStream() {
    if (this.hackathon) {
      this.router.navigate(['/live-stream', this.hackathon.id]);
    }
  }

  // You can add edit and delete functions
  editHackathon() {
    // Add logic to edit hackathon (show edit form, etc.)
    if (this.canModifyHackathon()) {
      // Navigate to edit page or show edit dialog
      console.log('Editing hackathon:', this.hackathon?.id);
    }
  }

  deleteHackathon() {
    if (this.canModifyHackathon() && this.hackathon?.id) {
      if (confirm('Are you sure you want to delete this hackathon?')) {
        this.hackathonService.deleteHackathon(this.hackathon.id).subscribe({
          next: () => {
            console.log('Hackathon deleted successfully');
            this.router.navigate(['/hackathons']);
          },
          error: (err) => {
            console.error('Error deleting hackathon:', err);
            alert('Failed to delete hackathon');
          }
        });
      }
    }
  }
}