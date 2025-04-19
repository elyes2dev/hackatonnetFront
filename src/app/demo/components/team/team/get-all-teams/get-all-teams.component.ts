import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy, AfterViewChecked } from '@angular/core';
import { TeamControllerService } from 'src/app/services/team-controller.service';
import { TeamDiscussionControllerService } from 'src/app/services/team-discussion-controller.service';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Team, TeamMembers, TeamDiscussion } from 'src/app/models';
import { finalize, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { UserControllerService } from 'src/app/services/user-controller.service';
import { FileUpload } from 'primeng/fileupload';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-get-all-teams',
  templateUrl: './get-all-teams.component.html',
  styleUrls: ['./get-all-teams.component.scss'],
  providers: [MessageService]
})
export class GetAllTeamsComponent implements OnInit, OnDestroy, AfterViewChecked {
  teams: Team[] = [];
  team: Team = {};
  selectedTeams: Team[] = [];
  selectedTeam: Team | null = null;
  teamMembers: TeamMembers[] = [];
  memberOptions: { label: string, value: number }[] = [];
  teamDialog: boolean = false;
  deleteTeamDialog: boolean = false;
  deleteTeamsDialog: boolean = false;
  teamMembersDialog: boolean = false;
  addUserDialog: boolean = false;
  removeUserDialog: boolean = false;
  conversationDialog: boolean = false;
  loadingTeamMember: boolean = false;
  submitted: boolean = false;
  loading: boolean = false;
  hackathonId: number | undefined;
  userId: number | null = null;
  teamMemberId: number | null = null;
  currentUser: string | null = null;
  discussions: { [key: number]: TeamDiscussion[] } = {};
  newMessage: string = '';
  sendingMessage: boolean = false;
  publicOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];
  private wsSubject: WebSocketSubject<any> | null = null;
  private wsSubscription: Subscription | null = null;
  private wsReconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000;

  // User selection properties
  availableUsers: { label: string, value: number }[] = [];
  selectedUserId: number | null = null;
  selectedMemberId: number | null = null;
  manualUserInput: string = '';

  // Enhanced chat properties
  showSearch: boolean = false;
  searchQuery: string = '';
  showPinnedMessages: boolean = false;
  pinnedMessages: TeamDiscussion[] = [];
  isSomeoneTyping: boolean = false;
  typingUser: string = '';
  typingTimeout: any;
  quotedMessage: TeamDiscussion | null = null;
  editingMessage: TeamDiscussion | null = null;
  emojiPickerVisible: boolean = false;
  fileUploadVisible: boolean = false;
  fileUploadType: 'image' | 'file' = 'file';
  selectedFile: File | null = null;

  // Statistics properties
  teamStats: {
    totalTeams: number;
    totalMembers: number;
    averageMembersPerTeam: number;
    mostActiveTeam: { id: number | undefined, name: string | undefined, messageCount: number } | null;
    teamsWithoutMessages: number;
    messageCountByTeam: { [key: number]: number };
  } = {
    totalTeams: 0,
    totalMembers: 0,
    averageMembersPerTeam: 0,
    mostActiveTeam: null,
    teamsWithoutMessages: 0,
    messageCountByTeam: {}
  };
  showStatistics: boolean = false;
  statisticsChartData: any;
  statisticsChartOptions: any;

  @ViewChild('dt') dt!: Table;
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('fileUpload') fileUpload!: FileUpload;

  constructor(
    private teamService: TeamControllerService,
    private teamDiscussionService: TeamDiscussionControllerService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private authService: AuthService,
    private userService: UserControllerService
  ) {}

  ngOnInit(): void {
    this.initializeUserData();
    this.loadTeams();
    this.loadAvailableUsers();
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
      console.error('Invalid or expired token');
      return;
    }
    this.userId = this.authService.getUserId();
    this.currentUser = this.authService.getUsername();
    if (!this.userId || !this.currentUser) {
      console.error('User information missing');
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
            id: msg.id || Date.now(),
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
    }
  }

  loadTeams(): void {
    this.loading = true;
    this.teams = [];
    this.teamService.getAllTeams().pipe(
      finalize(() => {
        this.loading = false;
        this.calculateStatistics(); // Calculate statistics after loading teams
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
        console.error('Failed to load teams:', error);
      }
    });
  }

  loadAvailableUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.availableUsers = users
          .filter(user => user.id != null)
          .map(user => ({
            label: `${user.name || user.username || 'Unknown'} (${user.email || 'No email'})`,
            value: user.id!
          }));
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load available users'
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
        this.team.hackathon = {
          id: this.hackathonId,
          title: '',
          maxTeamSize: 0,
          teams: []
        };
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

  openAddUserDialog(team: Team): void {
    this.selectedTeam = team;
    this.selectedUserId = null;
    this.manualUserInput = '';
    this.addUserDialog = true;
  }

  confirmAddUser(): void {
    if (!this.selectedTeam?.id || !this.selectedUserId || !this.selectedTeam.teamCode) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid team or user selection.'
      });
      return;
    }

    this.teamService.joinTeam({
      teamCode: this.selectedTeam.teamCode,
      userId: this.selectedUserId
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `User added to team ${this.selectedTeam!.teamName}.`
        });
        this.hideAddUserDialog();
        this.loadTeams();
      },
      error: (error) => {
        console.error('Failed to add user to team:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error || 'Failed to add user to team.'
        });
      }
    });
  }

  hideAddUserDialog(): void {
    this.addUserDialog = false;
    this.selectedTeam = null;
    this.selectedUserId = null;
  }

  openRemoveUserDialog(team: Team): void {
    this.selectedTeam = team;
    this.selectedMemberId = null;
    this.teamService.getTeamById({ id: team.id! }).subscribe({
      next: (teamDetails) => {
        this.teamMembers = teamDetails.teamMembers || [];
        this.memberOptions = this.teamMembers
          .filter(member => member.id != null)
          .map(member => ({
            label: member.user?.name || member.user?.username || 'Unknown',
            value: member.id!
          }));
        if (!this.teamMembers.length) {
          this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'No members to remove from this team.'
          });
          return;
        }
        this.removeUserDialog = true;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load team members.'
        });
      }
    });
  }

  confirmRemoveUser(): void {
    if (!this.selectedTeam?.id || !this.selectedMemberId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid team or member selection.'
      });
      return;
    }

    const selectedMember = this.teamMembers.find(member => member.id === this.selectedMemberId);
    if (!selectedMember?.user?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid user selection.'
      });
      return;
    }

    this.teamService.leaveTeam(selectedMember.user.id, this.selectedTeam.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `User removed from team ${this.selectedTeam!.teamName}.`
        });
        this.hideRemoveUserDialog();
        this.loadTeams();
      },
      error: (error) => {
        console.error('Failed to remove user from team:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error || 'Failed to remove user from team.'
        });
      }
    });
  }

  hideRemoveUserDialog(): void {
    this.removeUserDialog = false;
    this.selectedTeam = null;
    this.selectedMemberId = null;
    this.teamMembers = [];
    this.memberOptions = [];
  }

  // Bad words filter list (simple example, extend as needed)
  private badWords: string[] = [
    'badword1', 'badword2', 'badword3', 'damn', 'shit', 'fuck', 'bitch', 'asshole', 'bastard', 'crap', 'dick', 'piss', 'darn', 'cock', 'pussy', 'slut', 'whore', 'fag', 'cunt', 'nigger', 'retard', 'suck', 'jerk', 'idiot', 'stupid', 'moron', 'gay', 'lesbo', 'homo', 'twat', 'wank', 'bollocks', 'bugger', 'arse', 'prick', 'tosser', 'wanker', 'bollocks', 'arsehole', 'shag', 'git', 'muppet', 'knob', 'bellend', 'nonce', 'slag', 'twat', 'minge', 'pillock', 'plonker', 'numpty', 'berk', 'div', 'spaz', 'mong', 'gimp', 'chav', 'scrubber'
  ];

  // Checks if a message contains bad words
  private containsBadWords(message: string): boolean {
    const msg = message.toLowerCase();
    return this.badWords.some(word => msg.includes(word));
  }

  sendMessage(): void {
    console.log('Attempting to send message:', {
      teamId: this.selectedTeam?.id,
      teamMemberId: this.teamMemberId,
      message: this.newMessage,
      hasToken: !!this.authService.getToken()
    });

    if (!this.newMessage.trim()) {
      console.warn('Message cannot be empty');
      return;
    }

    // Bad words filter check
    if (this.containsBadWords(this.newMessage)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Your message contains inappropriate language. Please revise your message.'
      });
      return;
    }

    if (!this.selectedTeam?.id || !this.teamMemberId) {
      console.error('Invalid team or user');
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.error('Authentication token missing');
      this.authService.logout();
      return;
    }

    const payload = {
      message: this.newMessage.trim(),
      messageType: 'TEXT',
      teamId: this.selectedTeam.id.toString(),
      teamMemberId: this.teamMemberId.toString(),
      createdAt: new Date().toISOString(),
      status: 'SENT'
    };

    console.log('Sending message payload:', payload);

    this.sendingMessage = true;
    this.teamDiscussionService.sendMessageRest({
      teamId: this.selectedTeam.id,
      teamMemberId: this.teamMemberId,
      messageType: 'TEXT',
      Authorization: `Bearer ${token}`,
      body: payload
    }).pipe(
      finalize(() => {
        this.sendingMessage = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: TeamDiscussion) => {
        console.log('Message sent successfully:', response);
        const discussion: TeamDiscussion = {
          id: response.id ?? Date.now(),
          message: this.newMessage.trim(),
          team: { id: this.selectedTeam!.id! },
          teamMember: {
            id: this.teamMemberId!,
            user: {
              id: this.userId!,
              name: this.currentUser || 'Unknown'
            },
            role: 'MEMBER'
          },
          messageType: 'TEXT',
          isRead: false,
          createdAt: new Date().toISOString(),
          senderName: this.currentUser || 'Unknown',
          senderRole: 'MEMBER'
        };
        this.discussions[this.selectedTeam!.id!] = [
          ...(this.discussions[this.selectedTeam!.id!] || []),
          discussion
        ];
        this.newMessage = '';
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Message sent.'
        });
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Failed to send message:', error);
        if (error.status === 401) {
          this.authService.logout();
        }
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

  openConversationDialog(team: Team): void {
    if (!this.authService.isTokenValid()) {
      console.error('Invalid token');
      return;
    }
    if (!team || typeof team.id !== 'number') {
      console.error('Invalid team or missing team id');
      return;
    }
    this.selectedTeam = team;
    this.conversationDialog = true;
    this.loadingTeamMember = true;
    // Allow any user to open any chat: try to find or simulate membership
    this.teamService.getTeamById({ id: team.id }).subscribe({
      next: (teamDetails) => {
        // Try to find the teamMemberId for this user
        const teamMember = teamDetails.teamMembers?.find(member => member.user?.id === this.userId);
        if (teamMember?.id) {
          this.teamMemberId = teamMember.id;
        } else {
          // If user is not a member, simulate a temporary teamMemberId (e.g., -1)
          this.teamMemberId = -1;
        }
        if (typeof team.id === 'number') {
          this.loadTeamDiscussions(team.id);
          this.initializeWebSocket(team.id);
        } else {
          console.error('Cannot load discussions or initialize WebSocket: team id is missing');
        }
        this.loadingTeamMember = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to get team details:', error);
        this.loadingTeamMember = false;
        this.cdr.detectChanges();
      }
    });
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

  isOwnMessage(msg: any): boolean {
    return msg?.teamMember?.user?.id === this.authService.getUserId();
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

  onEnterPress(event: any): void {
    if (event && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer && this.chatContainer.nativeElement) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling:', err);
    }
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchQuery = '';
      this.onSearch();
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      const teamId = this.selectedTeam?.id;
      if (teamId) {
        this.discussions[teamId] = this.discussions[teamId].filter(msg => 
          msg.message?.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
    } else {
      if (this.selectedTeam?.id) {
        this.loadTeamDiscussions(this.selectedTeam.id);
      }
    }
  }

  togglePinnedMessages(): void {
    this.showPinnedMessages = !this.showPinnedMessages;
  }

  pinMessage(message: TeamDiscussion): void {
    if (!message.isPinned) {
      message.isPinned = true;
      this.pinnedMessages.push(message);
      this.teamDiscussionService.updateMessage({
        teamId: message.team?.id!,
        messageId: message.id!,
        body: { isPinned: true }
      }).subscribe();
    }
  }

  unpinMessage(message: TeamDiscussion): void {
    message.isPinned = false;
    this.pinnedMessages = this.pinnedMessages.filter(m => m.id !== message.id);
    this.teamDiscussionService.updateMessage({
      teamId: message.team?.id!,
        messageId: message.id!,
        body: { isPinned: false }
      }).subscribe();
  }

  quoteMessage(message: TeamDiscussion): void {
    this.quotedMessage = message;
  }

  editMessage(message: TeamDiscussion): void {
    this.editingMessage = message;
    this.newMessage = message.message || '';
  }

  canEditMessage(message: TeamDiscussion): boolean {
    return message.teamMember?.id === this.teamMemberId;
  }

  canDeleteMessage(message: TeamDiscussion): boolean {
    return message.teamMember?.id === this.teamMemberId || 
           this.selectedTeam?.teamMembers?.find(m => m.id === this.teamMemberId)?.role === 'LEADER';
  }

  deleteMessage(message: TeamDiscussion): void {
    message.isDeleted = true;
    message.deletedAt = new Date().toISOString();
    this.teamDiscussionService.updateMessage({
      teamId: message.team?.id!,
      messageId: message.id!,
      body: { isDeleted: true, deletedAt: message.deletedAt }
    }).subscribe();
  }

  forwardMessage(message: TeamDiscussion): void {
    console.log('Forwarding message:', message);
  }

  getMessageMenuItems(message: TeamDiscussion): MenuItem[] {
    return [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.editMessage(message),
        visible: this.canEditMessage(message)
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.deleteMessage(message),
        visible: this.canDeleteMessage(message)
      },
      {
        label: 'Forward',
        icon: 'pi pi-share-alt',
        command: () => this.forwardMessage(message)
      },
      {
        label: 'Pin',
        icon: 'pi pi-pin',
        command: () => this.pinMessage(message)
      }
    ];
  }

  toggleReaction(message: TeamDiscussion, emoji: string): void {
    if (!message.reactions) {
      message.reactions = [];
    }
    const reaction = message.reactions.find(r => r.emoji === emoji);
    if (reaction) {
      const userIndex = reaction.users.indexOf(this.userId!);
      if (userIndex > -1) {
        reaction.users.splice(userIndex, 1);
        reaction.count--;
        if (reaction.count === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        reaction.users.push(this.userId!);
        reaction.count++;
      }
    } else {
      message.reactions.push({
        emoji,
        count: 1,
        users: [this.userId!]
      });
    }
    this.teamDiscussionService.updateMessage({
      teamId: message.team?.id!,
      messageId: message.id!,
      body: { reactions: message.reactions }
    }).subscribe();
  }

  onTyping(): void {
    if (this.selectedTeam?.id && this.teamMemberId) {
      this.teamDiscussionService.sendTypingIndicator({
        teamId: this.selectedTeam.id,
        teamMemberId: this.teamMemberId
      }).subscribe();

      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }

      this.typingTimeout = setTimeout(() => {
        this.isSomeoneTyping = false;
        this.typingUser = '';
      }, 3000);
    }
  }

  openFileUpload(type: 'image' | 'file'): void {
    this.fileUploadType = type;
    this.fileUploadVisible = true;
  }

  uploadFile(): void {
    if (this.selectedFile && this.selectedTeam?.id && this.teamMemberId) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('teamId', this.selectedTeam.id.toString());
      formData.append('teamMemberId', this.teamMemberId.toString());
      formData.append('messageType', this.fileUploadType === 'image' ? 'IMAGE' : 'FILE');

      this.teamDiscussionService.uploadFile(formData).subscribe({
        next: (response: TeamDiscussion) => {
          this.fileUploadVisible = false;
          this.selectedFile = null;
          if (this.selectedTeam?.id) {
            this.loadTeamDiscussions(this.selectedTeam.id);
          }
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to upload file'
          });
        }
      });
    }
  }

  openEmojiPicker(): void {
    this.emojiPickerVisible = true;
  }

  onEmojiSelect(emoji: string): void {
    this.newMessage += emoji;
    this.emojiPickerVisible = false;
  }

  formatFileSize(bytes: number | undefined): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  openImagePreview(message: TeamDiscussion): void {
    if (message.fileUrl) {
      window.open(message.fileUrl, '_blank');
    }
  }

  downloadFile(message: TeamDiscussion): void {
    if (message.fileUrl) {
      const link = document.createElement('a');
      link.href = message.fileUrl;
      link.download = message.message || 'file';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  calculateStatistics(): void {
    // Reset statistics
    this.teamStats.totalTeams = this.teams.length;
    this.teamStats.totalMembers = 0;
    this.teamStats.messageCountByTeam = {};
    
    // Calculate total members and message counts
    this.teams.forEach(team => {
      if (team.id !== undefined) {
        // Count team members
        const memberCount = team.teamMembers?.length || 0;
        this.teamStats.totalMembers += memberCount;
        
        // Count messages per team
        const messageCount = this.discussions[team.id]?.length || 0;
        this.teamStats.messageCountByTeam[team.id] = messageCount;
      }
    });
    
    // Calculate average members per team
    this.teamStats.averageMembersPerTeam = this.teamStats.totalTeams > 0 
      ? parseFloat((this.teamStats.totalMembers / this.teamStats.totalTeams).toFixed(2)) 
      : 0;
    
    // Find most active team
    let maxMessages = 0;
    let mostActiveTeamId: number | undefined;
    
    Object.entries(this.teamStats.messageCountByTeam).forEach(([teamId, count]) => {
      if (count > maxMessages) {
        maxMessages = count;
        mostActiveTeamId = parseInt(teamId);
      }
    });
    
    if (mostActiveTeamId !== undefined && maxMessages > 0) {
      const team = this.teams.find(t => t.id === mostActiveTeamId);
      this.teamStats.mostActiveTeam = {
        id: mostActiveTeamId,
        name: team?.teamName,
        messageCount: maxMessages
      };
    } else {
      this.teamStats.mostActiveTeam = null;
    }
    
    // Count teams without messages
    this.teamStats.teamsWithoutMessages = this.teams.filter(team => 
      team.id !== undefined && (!this.teamStats.messageCountByTeam[team.id] || this.teamStats.messageCountByTeam[team.id] === 0)
    ).length;
    
    // Prepare chart data
    this.prepareChartData();
  }

  prepareChartData(): void {
    // Prepare data for team activity chart
    const teamLabels: string[] = [];
    const messageData: number[] = [];
    const memberData: number[] = [];
    
    this.teams.forEach(team => {
      if (team.id !== undefined && team.teamName) {
        teamLabels.push(team.teamName);
        messageData.push(this.teamStats.messageCountByTeam[team.id] || 0);
        memberData.push(team.teamMembers?.length || 0);
      }
    });
    
    this.statisticsChartData = {
      labels: teamLabels,
      datasets: [
        {
          label: 'Messages',
          data: messageData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        },
        {
          label: 'Members',
          data: memberData,
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgb(153, 102, 255)',
          borderWidth: 1
        }
      ]
    };
    
    this.statisticsChartOptions = {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Team Statistics'
        }
      }
    };
  }

  toggleStatistics(): void {
    this.showStatistics = !this.showStatistics;
    if (this.showStatistics) {
      this.calculateStatistics();
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  findUserByIdOrName(): void {
    if (!this.manualUserInput?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Input Required',
        detail: 'Please enter a user ID or username.'
      });
      return;
    }
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const input = this.manualUserInput.trim().toLowerCase();
        const found = users.find(u =>
          u.id?.toString() === input ||
          u.username?.toLowerCase() === input ||
          u.name?.toLowerCase() === input
        );
        if (found && found.id) {
          this.selectedUserId = found.id;
          this.messageService.add({
            severity: 'success',
            summary: 'User Found',
            detail: `User ${found.name || found.username || found.id} selected.`
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Not Found',
            detail: 'No user found with that ID or name.'
          });
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to search users.'
        });
      }
    });
  }
}