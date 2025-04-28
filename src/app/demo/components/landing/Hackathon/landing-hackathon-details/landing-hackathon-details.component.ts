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
import { ListMentorFormComponent } from '../../../list-mentor/list-mentor-form/list-mentor-form.component';
import { Team } from 'src/app/demo/models/team';
import { finalize, Subject, takeUntil } from 'rxjs';
import { TeamService } from 'src/app/demo/services/team.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TeamFrontofficeComponent } from '../../../team-frontoffice/team-frontoffice.component';
import { Prize, PrizeCategory } from 'src/app/demo/models/prize';
import { PrizeService } from 'src/app/demo/services/prize.service';

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
  userTeam: Team | null = null;
  private destroy$ = new Subject<void>();
  loading: boolean = false;
  loadingDialog: boolean = false;
  private ref: DynamicDialogRef | null = null;
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
    private teamService: TeamService,
    private prizeService: PrizeService // Add the prize service


  ) {}

  ngOnInit() {
    // Get the 'id' parameter from the route
    const hackathonId = this.route.snapshot.paramMap.get('id');
    if (hackathonId) {
      // Fetch the hackathon details based on the ID
      this.hackathonService.getHackathonById(hackathonId).subscribe((data: Hackathon) => {
        this.hackathon = data;
        const cachedTeam = this.getCachedUserTeam(+hackathonId);
        if (cachedTeam) {
            this.userTeam = cachedTeam;
        } else {
            // If no cached team, check if user is in a team for this hackathon
            this.checkUserTeam(+hackathonId);
        }
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
  private cacheUserTeam(team: Team | null, hackathonId: number): void {
    const cacheKey = `user_team_${this.user?.id}_${hackathonId}`;
    if (team) {
        localStorage.setItem(cacheKey, JSON.stringify(team));
    } else {
        localStorage.removeItem(cacheKey);
    }
}
  
  private getCachedUserTeam(hackathonId: number): Team | null {
    const cacheKey = `user_team_${this.user?.id}_${hackathonId}`;
    const cachedData = localStorage.getItem(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
}
private checkUserTeam(hackathonId: number): void {
  if (!this.user?.id) return;

  this.loading = true;
  this.teamService.getAllTeams().pipe(
      finalize(() => this.loading = false),
      takeUntil(this.destroy$)
  ).subscribe({
      next: (teams: Team[]) => {
          const team = teams.find(t =>
              t.hackathon?.id === hackathonId &&
              t.teamMembers?.some(member => member.user?.id === this.user?.id)
          );

          if (team) {
              this.userTeam = team;
              this.cacheUserTeam(team, hackathonId);
          } else {
              this.userTeam = null;
              this.cacheUserTeam(null, hackathonId);
          }
      },
      error: (error: HttpErrorResponse) => {
          console.error('Error checking user team:', error);
          this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to check team membership'
          });
      }
  });
}
participate() {
    if (!this.hackathon || this.loadingDialog || this.ref) {
        console.log('Participate blocked:', { hackathon: !!this.hackathon, loadingDialog: this.loadingDialog, dialogOpen: !!this.ref });
        return;
    }

    this.loadingDialog = true;
    const mode = this.userTeam ? 'chat' : 'participate';
    this.ref = this.dialogService.open(TeamFrontofficeComponent, {
        header: this.userTeam ? `Team Chat - ${this.userTeam.teamName}` : 'Participate in Hackathon',
        style: {
            width: this.userTeam ? '500px' : '85vw',
            maxWidth: this.userTeam ? '500px' : '1100px',
            color: '#6200EA',
            'font-family': 'Poppins, Arial, sans-serif',
            'font-size': '1.15rem',
            'font-weight': '600',
            'letter-spacing': '0.5px',
            'min-height': this.userTeam ? '600px' : '85vh',
            'background': 'linear-gradient(135deg, #ffffff 0%, #f5f0ff 100%)',
            'box-shadow': '0 10px 50px rgba(98, 0, 234, 0.2), 0 6px 20px rgba(98, 0, 234, 0.1)',
            'border-radius': '20px',
            'border': '1px solid #d0b3ff',
            'overflow': 'auto',
            'padding': '0',
            'position': 'relative',
            'top': '50%',
            'transform': 'translateY(-50%)',
            'margin': '0 auto'
        },
        styleClass: 'modern-dialog hackathon-dialog ' + (this.userTeam ? 'team-chat-dialog' : 'participate-dialog'),
        contentStyle: {
            'padding': '0',
            'border-radius': '20px',
            'overflow-y': 'auto',
            'overflow-x': 'hidden',
            'height': '100%',
            'scrollbar-width': 'thin',
            'scrollbar-color': '#d0b3ff #f5f0ff'
        },
        maximizable: true,
        closeOnEscape: true,
        dismissableMask: true,
        modal: true,
        baseZIndex: 1000,
        data: {
            hackathonId: this.hackathon.id,
            mode,
            teamId: this.userTeam?.id
        }
    });

    this.ref.onClose.pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
        console.log('Dialog closed with result:', result);
        if (result === 'left') {
            // User left the team
            this.userTeam = null;
            this.cacheUserTeam(null, this.hackathon!.id);
            this.messageService.add({
                severity: 'info',
                summary: 'Info',
                detail: 'You have left the team'
            });
            window.location.reload(); // Refresh the page after leaving team
        } else if (result) {
            // User joined a new team
            this.userTeam = result;
            this.cacheUserTeam(result, this.hackathon!.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `You are now part of team "${result.teamName}"`
            });
            window.location.reload(); // Refresh the page after joining/creating team
        }
        this.ref = null;
        this.loadingDialog = false;
    });
}
getParticipateButtonLabel(): string {
  return this.userTeam ? 'Open Team Chat' : 'Participate';
}

getParticipateButtonIcon(): string {
  return this.userTeam ? 'pi pi-comments' : 'pi pi-users';
}

public get dialogHeader(): string {
  if (this.ref && (this.ref as any).options && (this.ref as any).options.header) {
      return (this.ref as any).options.header;
  }
  return '';
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