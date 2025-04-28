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
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ListMentorService } from 'src/app/demo/services/list-mentor.service';
import { PrizeService } from 'src/app/demo/services/prize.service';
import { ListMentorFormComponent } from '../../../list-mentor/list-mentor-form/list-mentor-form.component';
import { Prize, PrizeCategory, PrizeType } from 'src/app/demo/models/prize';

@Component({
  selector: 'app-landing-hackathon-details',
  templateUrl: './landing-hackathon-details.component.html',
  styleUrls: ['./landing-hackathon-details.component.scss'],
  providers: [DialogService, MessageService]

})
export class LandingHackathonDetailsComponent implements OnInit {
  @ViewChild(PostListComponent) postListComponent!: PostListComponent;
  hackathon: Hackathon | null = null;
  display: boolean = false;
  displayPostForm: boolean = false;
  
  user!: User;
  isSponsor: boolean = false;
  isAlreadyMentor: boolean = false;
  existingMentorListing: any = null;
  dialogRef: DynamicDialogRef | undefined;
  // Add a property to store prizes
  prizes: Prize[] = [];
  prizeCount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private hackathonService: HackathonService,
    public router: Router,
    public layoutService: LayoutService, 
    private userService: UserService,
    private storageService: StorageService,
    private dialogService: DialogService,
    private listMentorService: ListMentorService,
    private messageService: MessageService,
    private prizeService: PrizeService // Add the prize service
  ) {}

  ngOnInit() {
    // Get the 'id' parameter from the route
    const hackathonId = this.route.snapshot.paramMap.get('id');
    if (hackathonId) {
      // Fetch the hackathon details based on the ID
      this.hackathonService.getHackathonById(hackathonId).subscribe((data: Hackathon) => {
        this.hackathon = data;
        this.checkMentorStatus();

        // Fetch prizes count for this hackathon
        this.getPrizesCount(Number(hackathonId));
        // Fetch prizes for this hackathon
        this.loadPrizes(Number(hackathonId));

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

  checkMentorStatus(): void {
    const userId = this.storageService.getLoggedInUserId();
    const hackathonId = this.hackathon?.id;
    
    // Reset mentor status when checking a new hackathon
    this.isAlreadyMentor = false;
    this.existingMentorListing = null;
    
    if (userId && hackathonId) {
      // Get mentors for this hackathon
      this.listMentorService.getListMentorsByHackathonId(hackathonId).subscribe(
        mentorListings => {
          // Check if current user is already a mentor for THIS hackathon
          const userListing = mentorListings.find(
            listing => listing.mentor && listing.mentor.id === userId
          );
          
          if (userListing) {
            this.isAlreadyMentor = true;
            this.existingMentorListing = userListing;
            console.log('Found existing mentor listing:', userListing);
          } else {
            this.isAlreadyMentor = false;
            this.existingMentorListing = null;
            console.log('No existing mentor listing found for this hackathon');
          }
        },
        error => {
          console.error('Error checking mentor status:', error);
          this.isAlreadyMentor = false;
          this.existingMentorListing = null;
        }
      );
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

  // Add a new method to get prizes count
  getPrizesCount(hackathonId: number): void {
    // You need to modify the prize service to accept a hackathon ID parameter
    this.prizeService.getPrizesByHackathonId(hackathonId).subscribe({
      next: (prizes) => {
        this.prizeCount = prizes.length;
      },
      error: (err) => {
        console.error('Error fetching prizes:', err);
        this.prizeCount = 0; // Default to 0 if there's an error
      }
    });
  }

  // Add a method to load prizes
  loadPrizes(hackathonId: number): void {
    this.prizeService.getPrizesByHackathonId(hackathonId).subscribe({
      next: (prizes) => {
        this.prizes = prizes;
        this.prizeCount = prizes.length;
      },
      error: (err) => {
        console.error('Error fetching prizes:', err);
        this.prizes = [];
        this.prizeCount = 0;
      }
    });
  }

  // Helper method to convert prize category enum to readable text
  getPrizeCategoryName(category: PrizeCategory): string {
    switch(category) {
      case PrizeCategory.BEST_INNOVATION:
        return 'Best Innovation';
      case PrizeCategory.BEST_DESIGN:
        return 'Best Design';
      case PrizeCategory.BEST_AI_PROJECT:
        return 'Best AI Project';
      default:
        // Force TypeScript to treat it as a string
        return String(category).replace('_', ' ');
    }
  }

  applyAsMentor() {
    if (!this.hackathon || !this.user) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'You must be logged in to apply as a mentor'
      });
      return;
    }
  
    // Only pass mentorListingId if there's a valid existing mentor listing for THIS hackathon
    const mentorListingId = this.isAlreadyMentor && this.existingMentorListing ? 
      this.existingMentorListing.id : null;
  
    // Show the dialog
    this.dialogRef = this.dialogService.open(ListMentorFormComponent, {
      header: this.isAlreadyMentor ? 'Update Mentor Application' : 'Apply as Mentor',
      width: '450px',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: {
        hackathonId: this.hackathon.id,
        mentorListingId: mentorListingId
      }
    });

    // Handle the dialog close event
    this.dialogRef.onClose.subscribe((result) => {
      if (result) {
        // Success - refresh mentor status
        this.checkMentorStatus();
        
        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isAlreadyMentor 
            ? 'Your mentor application has been updated!'
            : 'Your mentor application has been submitted!'
        });
      }
    });
  }
}