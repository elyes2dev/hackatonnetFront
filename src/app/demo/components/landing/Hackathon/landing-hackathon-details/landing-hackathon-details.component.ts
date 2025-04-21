import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { PostListComponent } from 'src/app/demo/components/posts/post-list/post-list.component';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { UserService } from 'src/app/demo/services/user.service';
import { User } from 'src/app/demo/models/user.model';
import { StorageService } from 'src/app/demo/services/storage.service';

@Component({
  selector: 'app-landing-hackathon-details',
  templateUrl: './landing-hackathon-details.component.html',
  styleUrls: ['./landing-hackathon-details.component.scss']
})
export class LandingHackathonDetailsComponent implements OnInit {
  @ViewChild(PostListComponent) postListComponent!: PostListComponent;
  hackathon: Hackathon | null = null;
  display: boolean = false;
  displayPostForm: boolean = false;
  
  user!: User;
  isSponsor: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private hackathonService: HackathonService,
    public router: Router,
    public layoutService: LayoutService, 
    private userService: UserService,
    private storageService: StorageService
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

    // Get logged in user for badge icon
    const userId = this.storageService.getLoggedInUserId();
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (userData: User) => {
          this.user = userData;
          
          // Check for SPONSOR role in user data
          if (userData.roles) {
            // Handle both array of Role objects and array of strings
            this.isSponsor = userData.roles.some(role => {
              if (typeof role === 'string') {
                return role === 'SPONSOR';
              } else if (role && typeof role === 'object') {
                return role.name === 'SPONSOR';
              }
              return false;
            });
          }
        },
        error: (err) => console.error('Error fetching user data:', err)
      });
    }
  }

  navigateToLanding() {
    this.router.navigate(['/landing']);
  }
  
  getBadgeIcon(): string {
    const badgeIcons: { [key: string]: string } = {
      JUNIOR_COACH: 'assets/demo/images/avatar/JUNIOR_COACH.png',
      ASSISTANT_COACH: 'assets/demo/images/avatar/ASSISTANT_COACH.png',
      SENIOR_COACH: 'assets/demo/images/avatar/SENIOR_COACH.png',
      HEAD_COACH: 'assets/demo/images/avatar/HEAD_COACH.png',
      MASTER_MENTOR: 'assets/demo/images/avatar/MASTER_MENTOR.png'
    };
    
    // This will work with both badge as string and badge as enum
    return this.user && this.user.badge ? badgeIcons[this.user.badge] || 'assets/icons/default_badge.png' : '';
  }

  JoinLiveStream() {
    if (this.hackathon) {
      this.router.navigate(['/landing-live-stream', this.hackathon.id]);
    }
  }

  addPrize(hackathonId: number | undefined) {
    if (!hackathonId) return;
    this.router.navigate(['/prize-form', hackathonId]);
  }
}