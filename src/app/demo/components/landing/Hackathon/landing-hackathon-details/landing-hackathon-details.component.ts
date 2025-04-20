import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';  // Ensure correct path
import { Hackathon } from 'src/app/demo/models/hackathon';  // Ensure correct path
import { PostService } from 'src/app/demo/services/post/post.service';
import { PostFormComponent } from 'src/app/demo/components/posts/post-form/post-form/post-form.component';
import { PostListComponent } from 'src/app/demo/components/posts/post-list/post-list.component';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { UserService } from 'src/app/demo/services/user.service';
import { User } from 'src/app/demo/models/user.model';

@Component({
  selector: 'app-landing-hackathon-details',
  templateUrl: './landing-hackathon-details.component.html',
  styleUrls: ['./landing-hackathon-details.component.scss']
})
export class LandingHackathonDetailsComponent {
  @ViewChild(PostListComponent) postListComponent!: PostListComponent;
  hackathon: Hackathon | null = null;  // Store selected hackathon
  display: boolean = false;
  displayPostForm: boolean = false;
  
  user!: User;


  constructor(
    private route: ActivatedRoute,
    private hackathonService: HackathonService,
    public router: Router,
    public layoutService: LayoutService, private userService: UserService
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


    this.userService.getUserById(1).subscribe((data) => {
      this.user = data;
    });
  }


  navigateToLanding() {
    this.router.navigate(['/landing']);  // Redirect to '/landings'
  }
  getBadgeIcon(): string {
    const badgeIcons: { [key: string]: string } = {
      JUNIOR_COACH: 'assets/demo/images/avatar/JUNIOR_COACH.png',
      ASSISTANT_COACH: 'assets/demo/images/avatar/ASSISTANT_COACH.png',
      SENIOR_COACH: 'assets/demo/images/avatar/SENIOR_COACH.png',
      HEAD_COACH: 'assets/demo/images/avatar/HEAD_COACH.png',
      MASTER_MENTOR: 'assets/demo/images/avatar/MASTER_MENTOR.png'
    };
    return this.user ? badgeIcons[this.user.badge] || 'assets/icons/default_badge.png' : '';
  }

  JoinLiveStream() {
    if (this.hackathon) {
      this.router.navigate(['/landing-live-stream', this.hackathon.id]);
    }
  }

}
