import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';  // Ensure correct path
import { Hackathon } from 'src/app/demo/models/hackathon';  // Ensure correct path
import { PostService } from 'src/app/demo/services/post/post.service';
import { PostFormComponent } from 'src/app/demo/components/posts/post-form/post-form/post-form.component';
import { PostListComponent } from 'src/app/demo/components/posts/post-list/post-list.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hackathon-details',
  templateUrl: './hackathon-details.component.html',
  styleUrls: ['./hackathon-details.component.scss']
})
export class HackathonDetailsComponent implements OnInit {
  @ViewChild(PostListComponent) postListComponent!: PostListComponent;
  hackathon: Hackathon | null = null;  // Store selected hackathon
  display: boolean = false;
  displayPostForm: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private hackathonService: HackathonService,
    private router: Router
  ) {}

  ngOnInit() {
    // Get the 'id' parameter from the route
    const hackathonId = this.route.snapshot.paramMap.get('id');

    if (hackathonId) {
      // Fetch the hackathon details based on the ID
      this.hackathonService.getHackathonById(hackathonId).subscribe((data: Hackathon) => {
        this.hackathon = data;
      });
    }
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
}


