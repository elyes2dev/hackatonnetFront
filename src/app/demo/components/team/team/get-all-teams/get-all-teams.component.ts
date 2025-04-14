import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { TeamControllerService } from 'src/app/services/team-controller.service';
import { TeamDiscussionControllerService } from 'src/app/services/team-discussion-controller.service';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Team, TeamMembers, TeamDiscussion } from 'src/app/models';
import { finalize, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Component({
  selector: 'app-get-all-teams',
  templateUrl: './get-all-teams.component.html',
  styleUrls: ['./get-all-teams.component.scss'],
  providers: [MessageService]
})
export class GetAllTeamsComponent implements OnInit, OnDestroy {
  teams: Team[] = [];
  team: Team = {};
  selectedTeams: Team[] = [];
  selectedTeam: Team | null = null;
  teamMembers: TeamMembers[] = [];
  teamDialog: boolean = false;
  deleteTeamDialog: boolean = false;
  deleteTeamsDialog: boolean = false;
  teamMembersDialog: boolean = false;
  joinTeamDialog: boolean = false;
  leaveTeamDialog: boolean = false;
  conversationDialog: boolean = false;
  loadingTeamMember: boolean = false;
  submitted: boolean = false;
  joinSubmitted: boolean = false;
  leaveSubmitted: boolean = false;
  loading: boolean = false;
  hackathonId: number | undefined;
  userId: number | null = null;
  teamMemberId: number | null = null;
  currentUser: string | null = null;
  discussions: { [key: number]: TeamDiscussion[] } = {};
  newMessage: string = '';
  publicOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];
  private wsSubject: WebSocketSubject<any> | null = null;
  private wsSubscription: Subscription | null = null;
  private wsReconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000;

  @ViewChild('dt') dt!: Table;
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(
    private teamService: TeamControllerService,
    private teamDiscussionService: TeamDiscussionControllerService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeUserData();
    this.loadTeams();
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.wsSubject) {
      this.wsSubject.complete();
    }
  }

  private initializeUserData(): void {
    if (!this.authService.isTokenValid()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid or expired token. Please log in.'
      });
      return;
    }
    this.userId = this.authService.getUserId();
    this.currentUser = this.authService.getUsername();
    if (!this.userId || !this.currentUser) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User information missing. Please log in.'
      });
    }
  }

  private initializeWebSocket(teamId: number): void {
    if (this.wsSubject) {
      this.wsSubject.complete();
      this.wsSubscription?.unsubscribe();
    }

    const connect = () => {
      console.log(`Attempting WebSocket connection for team ${teamId}, attempt ${this.wsReconnectAttempts + 1}`);
      this.wsSubject = webSocket({
        url: `ws://localhost:9100/ws`,
        openObserver: {
          next: () => {
            console.log('WebSocket connection established');
            this.wsReconnectAttempts = 0;
            this.subscribeToTeam(teamId);
          }
        },
        closeObserver: {
          next: () => {
            console.log('WebSocket connection closed');
            this.attemptReconnect(teamId);
          }
        }
      });

      this.wsSubscription = this.wsSubject.subscribe({
        next: (msg: any) => {
          console.log('WebSocket message received:', msg);
          const discussion: TeamDiscussion = {
            id: msg.id,
            message: msg.message || 'Message missing in WebSocket payload',
            team: { id: teamId },
            teamMember: {
              id: msg.teamMemberId,
              user: {
                id: msg.userId,
                name: msg.teamMember?.user?.name || msg.senderName || 'Unknown'
              },
              role: msg.teamMember?.role || 'Unknown'
            },
            messageType: msg.messageType || 'TEXT',
            isRead: msg.isRead ?? false,
            createdAt: msg.createdAt || new Date().toISOString(),
            senderName: msg.teamMember?.user?.name || msg.senderName || 'Unknown',
            senderRole: msg.teamMember?.role || 'Unknown'
          };
          console.log('Adding WebSocket discussion:', discussion);
          this.discussions[teamId] = [...(this.discussions[teamId] || []), discussion];
          this.cdr.detectChanges();
          this.scrollToBottom();
        },
        error: (err) => {
          console.error('WebSocket error:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'WebSocket connection failed'
          });
          this.attemptReconnect(teamId);
        },
        complete: () => console.log('WebSocket subscription completed')
      });
    };

    connect();
  }

  private subscribeToTeam(teamId: number): void {
    if (this.wsSubject) {
      this.wsSubject.next({ type: 'subscribe', destination: `/topic/team/${teamId}` });
      console.log(`Subscribed to /topic/team/${teamId}`);
    }
  }

  private attemptReconnect(teamId: number): void {
    if (this.wsReconnectAttempts < this.maxReconnectAttempts) {
      this.wsReconnectAttempts++;
      console.log(`Reconnecting WebSocket in ${this.reconnectDelay}ms, attempt ${this.wsReconnectAttempts}`);
      setTimeout(() => this.initializeWebSocket(teamId), this.reconnectDelay);
    } else {
      console.error('Max WebSocket reconnect attempts reached');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to reconnect to WebSocket. Please refresh the page.'
      });
    }
  }

  loadTeams(): void {
    this.loading = true;
    this.teams = [];
    this.teamService.getAllTeams().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (teams) => {
        this.teams = teams || [];
        if (!this.teams.length) {
          this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'No teams available'
          });
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.status === 401 ? 'Unauthorized. Please log in.' : 'Failed to load teams'
        });
      }
    });
  }

  saveTeam(): void {
    this.submitted = true;
    if (this.team.teamName?.trim() && this.hackathonId) {
      if (this.team.id) {
        this.teamService.updateTeam({ id: this.team.id, body: this.team }).subscribe({
          next: (updatedTeam) => {
            const index = this.teams.findIndex(t => t.id === updatedTeam.id);
            this.teams[index] = updatedTeam;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Team updated'
            });
            this.hideDialog();
            this.cdr.detectChanges();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update team'
            });
          }
        });
      } else {
        this.team.hackathon = { id: this.hackathonId };
        this.teamService.createTeam({
          hackathonId: this.hackathonId,
          leaderId: this.userId!,
          body: this.team
        }).subscribe({
          next: (newTeam) => {
            this.teams.push(newTeam);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Team created'
            });
            this.hideDialog();
            this.cdr.detectChanges();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create team'
            });
          }
        });
      }
    }
  }

  private getTeamMemberId(teamId: number): void {
    if (!this.userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User information missing'
      });
      this.hideConversationDialog();
      return;
    }

    this.loadingTeamMember = true;
    this.teamService.getTeamById({ id: teamId }).subscribe({
      next: (team) => {
        const teamMember = team.teamMembers?.find(member => member.user?.id === this.userId);
        if (teamMember?.id) {
          this.teamMemberId = teamMember.id;
          console.log('Selected teamMemberId:', this.teamMemberId);
          this.loadTeamDiscussions(teamId);
          this.initializeWebSocket(teamId);
        } else {
          this.teamMemberId = null;
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'You are not a member of this team. Please join first.'
          });
          this.hideConversationDialog();
          this.openJoinTeamDialog(team);
        }
      },
      error: () => {
        this.teamMemberId = null;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to get team member information'
        });
        this.hideConversationDialog();
      },
      complete: () => {
        this.loadingTeamMember = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmJoinTeam(): void {
    this.joinSubmitted = true;
    if (this.selectedTeam?.teamCode && this.userId) {
      this.teamService.joinTeam({
        teamCode: this.selectedTeam.teamCode,
        userId: this.userId
      }).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Successfully joined team ${this.selectedTeam!.teamName}`
          });
          this.hideJoinTeamDialog();
          this.loadTeams();
          if (this.selectedTeam?.id) {
            this.openConversationDialog(this.selectedTeam);
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to join team'
          });
        }
      });
    }
  }

  confirmLeaveTeam(): void {
    this.leaveSubmitted = true;
    if (this.selectedTeam?.id && this.userId) {
      this.teamService.leaveTeam(this.userId, this.selectedTeam.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Successfully left team ${this.selectedTeam!.teamName}`
          });
          this.hideLeaveTeamDialog();
          this.loadTeams();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to leave team'
          });
        }
      });
    }
  }

  loadTeamDiscussions(teamId: number): void {
    this.teamDiscussionService.getTeamDiscussions({ teamId }).subscribe({
      next: (response: any) => {
        console.log('Raw discussions response for team', teamId, response);
        let discussions: TeamDiscussion[] = [];
        if (response instanceof Blob) {
          response.text().then(text => {
            discussions = JSON.parse(text) || [];
            this.processDiscussions(teamId, discussions);
          }).catch(err => {
            console.error('Failed to parse Blob response:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to parse discussion data'
            });
          });
        } else {
          discussions = response || [];
          this.processDiscussions(teamId, discussions);
        }
      },
      error: (error) => {
        console.error('Failed to load discussions:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.status === 401 ? 'Session expired. Please log in.' : 'Failed to load discussions'
        });
      }
    });
  }

  private processDiscussions(teamId: number, discussions: TeamDiscussion[]): void {
    this.discussions[teamId] = discussions.map(d => ({
      ...d,
      senderName: d.teamMember?.user?.name || d.teamMember?.user?.username || 'Unknown',
      senderRole: d.teamMember?.role || 'Unknown'
    })) || [];
    console.log('Mapped discussions:', this.discussions[teamId]);
    this.cdr.detectChanges();
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (!this.selectedTeam?.id || !this.newMessage.trim() || !this.teamMemberId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: !this.teamMemberId ? 'Not a team member' : 'Invalid message or team'
      });
      return;
    }

    console.log('Sending with teamMemberId:', this.teamMemberId);
    const payload = { message: this.newMessage.trim() };

    this.teamDiscussionService.sendMessageRest({
      teamId: this.selectedTeam.id,
      teamMemberId: this.teamMemberId,
      messageType: 'TEXT',
      Authorization: `Bearer ${this.authService.getToken()}`,
      body: payload
    }).subscribe({
      next: (response: any) => {
        console.log('Message sent, response:', response);
        const discussion: TeamDiscussion = {
          id: response.id,
          message: response.message || this.newMessage,
          team: { id: this.selectedTeam!.id },
          teamMember: {
            id: response.teamMemberId,
            user: {
              id: response.userId || this.userId,
              name: response.teamMember?.user?.name || response.senderName || this.currentUser || 'Unknown'
            },
            role: response.teamMember?.role || response.senderRole || 'Unknown'
          },
          messageType: response.messageType || 'TEXT',
          isRead: response.isRead ?? false,
          createdAt: response.createdAt || new Date().toISOString(),
          senderName: response.teamMember?.user?.name || response.senderName || this.currentUser || 'Unknown',
          senderRole: response.teamMember?.role || response.senderRole || 'Unknown'
        };
        console.log('Adding sent discussion:', discussion);
        this.discussions[this.selectedTeam!.id!] = [
          ...(this.discussions[this.selectedTeam!.id!] || []),
          discussion
        ];
        this.newMessage = '';
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Send message error:', error);
        let errorMessage = 'Failed to send message';
        if (error.status === 403) {
          errorMessage = 'Unauthorized or not a team member. Please join the team.';
          this.openJoinTeamDialog(this.selectedTeam!);
        } else if (error.status === 401) {
          errorMessage = 'Session expired. Please log in.';
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }

  openNew(): void {
    this.team = {};
    this.hackathonId = undefined;
    this.submitted = false;
    this.teamDialog = true;
  }

  editTeam(team: Team): void {
    this.team = { ...team };
    this.hackathonId = team.hackathon?.id;
    this.submitted = false;
    this.teamDialog = true;
  }

  deleteTeam(team: Team): void {
    this.team = team;
    this.deleteTeamDialog = true;
  }

  confirmDelete(): void {
    if (this.team.id) {
      this.teamService.deleteTeam({ id: this.team.id }).subscribe({
        next: () => {
          this.teams = this.teams.filter(t => t.id !== this.team.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Team deleted'
          });
          this.deleteTeamDialog = false;
          this.team = {};
          this.cdr.detectChanges();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete team'
          });
        }
      });
    }
  }

  deleteSelectedTeams(): void {
    this.deleteTeamsDialog = true;
  }

  confirmDeleteSelected(): void {
    const deletePromises = this.selectedTeams.map(team =>
      this.teamService.deleteTeam({ id: team.id! }).toPromise()
    );
    Promise.all(deletePromises)
      .then(() => {
        this.teams = this.teams.filter(t => !this.selectedTeams.includes(t));
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Teams deleted'
        });
        this.selectedTeams = [];
        this.deleteTeamsDialog = false;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete teams'
        });
      });
  }

  hideDialog(): void {
    this.teamDialog = false;
    this.teamMembersDialog = false;
    this.submitted = false;
    this.cdr.detectChanges();
  }

  openJoinTeamDialog(team: Team): void {
    this.selectedTeam = team;
    this.joinSubmitted = false;
    this.joinTeamDialog = true;
  }

  hideJoinTeamDialog(): void {
    this.joinTeamDialog = false;
    this.selectedTeam = null;
  }

  openLeaveTeamDialog(team: Team): void {
    this.selectedTeam = team;
    this.leaveSubmitted = false;
    this.leaveTeamDialog = true;
  }

  hideLeaveTeamDialog(): void {
    this.leaveTeamDialog = false;
    this.selectedTeam = null;
  }

  openConversationDialog(team: Team): void {
    if (!this.authService.isTokenValid()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid token. Please log in.'
      });
      return;
    }
    if (!team || !team.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid team'
      });
      return;
    }
    this.selectedTeam = team;
    this.conversationDialog = true;
    this.loadingTeamMember = true;
    this.getTeamMemberId(team.id);
  }

  hideConversationDialog(): void {
    this.conversationDialog = false;
    this.selectedTeam = null;
    this.newMessage = '';
    this.teamMemberId = null;
    this.loadingTeamMember = false;
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.wsSubject) {
      this.wsSubject.complete();
    }
    this.cdr.detectChanges();
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onImport(event: Event): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Import',
      detail: 'Import functionality not implemented'
    });
  }

  viewTeamMembers(team: Team): void {
    if (team.id) {
      this.team = team;
      this.teamService.getTeamById({ id: team.id }).subscribe({
        next: (teamDetails) => {
          this.teamMembers = teamDetails.teamMembers || [];
          if (!this.teamMembers.length) {
            this.messageService.add({
              severity: 'info',
              summary: 'Info',
              detail: 'No members found for this team'
            });
          }
          this.teamMembersDialog = true;
          this.cdr.detectChanges();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load team members'
          });
        }
      });
    }
  }

  getDiscussionCount(): number {
    const teamId = this.selectedTeam?.id;
    return teamId !== undefined ? this.discussions[teamId]?.length || 0 : 0;
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase();
  }

  hasDiscussions(teamId: number | undefined): boolean {
    if (!teamId) return false;
    return !!this.discussions[teamId]?.length;
  }

  getDiscussionsForTeam(teamId: number | undefined): TeamDiscussion[] {
    if (!teamId) return [];
    return this.discussions[teamId] || [];
  }

  getMessageTime(createdAt: string | Date | undefined): string {
    if (!createdAt) return '';
    const date = new Date(createdAt);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  getMessageDate(createdAt: string | Date | undefined): string {
    if (!createdAt) return '';
    const date = new Date(createdAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  canSendMessage(): boolean {
    return !!this.newMessage.trim() && !!this.teamMemberId;
  }

  isCurrentUserMessage(teamMemberId: number | undefined): boolean {
    return teamMemberId === this.teamMemberId;
  }

  getMessageClass(teamMemberId: number | undefined): string {
    return this.isCurrentUserMessage(teamMemberId) ? 'current-user' : 'other-user';
  }

  shouldShowDateSeparator(currentMsg: TeamDiscussion, prevMsg: TeamDiscussion | null): boolean {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt!);
    const prevDate = new Date(prevMsg.createdAt!);
    return currentDate.toDateString() !== prevDate.toDateString();
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.chatContainer) {
          const element = this.chatContainer.nativeElement;
          element.scrollTop = element.scrollHeight;
          console.log('Scrolled to bottom, scrollHeight:', element.scrollHeight);
        }
      }, 100);
    } catch (err) {
      console.error('Error scrolling:', err);
    }
  }
}