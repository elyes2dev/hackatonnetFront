import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';  // Ensure correct path
import { Hackathon } from 'src/app/demo/models/hackathon';  // Ensure correct path
import { PostService } from 'src/app/demo/services/post/post.service';
import { PostFormComponent } from 'src/app/demo/components/posts/post-form/post-form/post-form.component';
import { PostListComponent } from 'src/app/demo/components/posts/post-list/post-list.component';
import { Router } from '@angular/router';
import { Team } from 'src/app/models/team';
import { TeamFrontofficeComponent } from '../../team-frontoffice/team-frontoffice.component';
import { TeamControllerService } from 'src/app/services/team-controller.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-hackathon-details',
  templateUrl: './hackathon-details.component.html',
  styleUrls: ['./hackathon-details.component.scss'],
    providers: [DialogService]

})
export class HackathonDetailsComponent implements OnInit {
  @ViewChild(PostListComponent) postListComponent!: PostListComponent;
  hackathon: Hackathon | null = null;  // Store selected hackathon
  display: boolean = false;
  displayPostForm: boolean = false;
    userTeam: Team | null = null;
    userId: number | null = null;
    private ref: DynamicDialogRef | null = null;
    private destroy$ = new Subject<void>();
    loading: boolean = false;
    loadingDialog: boolean = false;

    constructor(
    private route: ActivatedRoute,
    private hackathonService: HackathonService,
    private router: Router,
    private teamService: TeamControllerService,
    private authService: AuthService,
    private messageService: MessageService,
    private dialogService: DialogService
  ) {
      this.userId = this.authService.getUserId();

  }



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
          }

      });
    }
  }

    private getCachedUserTeam(hackathonId: number): Team | null {
        const cacheKey = `user_team_${this.userId}_${hackathonId}`;
        const cachedData = localStorage.getItem(cacheKey);
        return cachedData ? JSON.parse(cachedData) : null;
    }
    private cacheUserTeam(team: Team | null, hackathonId: number): void {
        const cacheKey = `user_team_${this.userId}_${hackathonId}`;
        if (team) {
            localStorage.setItem(cacheKey, JSON.stringify(team));
        } else {
            localStorage.removeItem(cacheKey);
        }
    }
    private checkUserTeam(hackathonId: number): void {
        if (!this.userId) return;

        this.loading = true;
        this.teamService.getAllTeams().pipe(
            finalize(() => this.loading = false),
            takeUntil(this.destroy$)
        ).subscribe({
            next: (teams: Team[]) => {
                const team = teams.find(t =>
                    t.hackathon?.id === hackathonId &&
                    t.teamMembers?.some(member => member.user?.id === this.userId)
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
                width: this.userTeam ? '1000px' : '600px',
                color: '#a259e6', // Purple text
                'font-family': 'Poppins, Arial, sans-serif',
                'font-size': '1.12rem',
                'font-style': 'italic',
                'font-color': '#a259e6',
                'font-weight': '500',
                'min-height': '90vh',
                'background': 'linear-gradient(135deg, #f3e8fd 0%, #e1bee7 100%)',
                'box-shadow': '0 8px 40px 0 rgba(162,89,230,0.18), 0 2px 32px 0 #ba68c844',
                'box-radius': '50px',
                'padding': '0',
                'border-radius': '50px',
                'border': '3px solid #ba68c8',
            },
            styleClass: 'futuristic-dialog no-white-bg purple-dialog',
            maximizable: this.userTeam ? true : false,
            closeOnEscape: false,
            dismissableMask: false,
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
            } else if (result) {
                // User joined a new team
                this.userTeam = result;
                this.cacheUserTeam(result, this.hackathon!.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `You are now part of team "${result.teamName}"`
                });
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

