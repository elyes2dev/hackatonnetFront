import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { TeamDiscussionControllerService } from 'src/app/services/team-discussion-controller.service';
import { TeamControllerService } from 'src/app/services/team-controller.service';
import { TeamDiscussion } from 'src/app/models/team-discussion';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-team-conversation-frontoffice',
  templateUrl: './team-conversation.component.html',
  styleUrls: ['./team-conversation.component.scss'],
  providers: [MessageService]
})
export class TeamConversationComponent implements OnInit {
  @Input() teamId!: number;
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  // Discussion related properties
  discussions: TeamDiscussion[] = [];
  newMessage: string = '';
  loading: boolean = false;

  // User related properties
  currentUser: string | null = null;
  userId: number | null = null;
  teamMemberId: number | null = null;

  constructor(
    private discussionService: TeamDiscussionControllerService,
    private teamService: TeamControllerService,
    private messageService: MessageService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeUserData();
    if (this.teamId) {
      this.getTeamMemberId();
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

  private getTeamMemberId(): void {
    if (!this.userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User information missing'
      });
      return;
    }

    this.loading = true;
    this.teamService.getTeamById({ id: this.teamId }).subscribe({
      next: (team) => {
        const teamMember = team.teamMembers?.find(member => member.user?.id === this.userId);
        if (teamMember?.id) {
          this.teamMemberId = teamMember.id;
          console.log('Selected teamMemberId:', this.teamMemberId);
          this.loadDiscussions();
        } else {
          this.teamMemberId = null;
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'You are not a member of this team.'
          });
        }
      },
      error: () => {
        this.teamMemberId = null;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to get team member information'
        });
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadDiscussions(): void {
    this.loading = true;
    this.discussionService.getTeamDiscussions({ teamId: this.teamId })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (discussions: TeamDiscussion[]) => {
          this.discussions = discussions;
          this.scrollToBottom();
        },
        error: (error: any) => {
          console.error('Failed to load discussions:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load discussions'
          });
        }
      });
  }

  sendMessage(): void {
    if (!this.teamId || !this.newMessage.trim() || !this.teamMemberId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: !this.teamMemberId ? 'Team member information not found' : 'Invalid message or team'
      });
      return;
    }

    const payload = { message: this.newMessage.trim() };

    this.discussionService.sendMessageRest({
      teamId: this.teamId,
      teamMemberId: this.teamMemberId,
      messageType: 'TEXT',
      Authorization: `Bearer ${this.authService.getToken()}`,
      body: payload
    }).subscribe({
      next: () => {
        this.loadDiscussions();
        this.newMessage = '';
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (error: any) => {
        console.error('Error sending message:', error);
        let errorMessage = 'Failed to send message';
        if (error.status === 403) {
          errorMessage = 'You are not a member of this team.';
        } else if (error.status === 401) {
          errorMessage = 'You are not authorized. Please log in again.';
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
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

  isCurrentUserMessage(teamMemberId: number | undefined): boolean {
    return teamMemberId === this.teamMemberId;
  }

  getUserInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase();
  }

  getMessageAlignment(teamMemberId: number | undefined): string {
    return this.isCurrentUserMessage(teamMemberId) ? 'right' : 'left';
  }

  getMessageClass(teamMemberId: number | undefined): string {
    return this.isCurrentUserMessage(teamMemberId) ? 'current-user' : 'other-user';
  }

  getDiscussionCount(): number {
    return this.discussions.length;
  }

  isMessagesEmpty(): boolean {
    return this.discussions.length === 0;
  }

  shouldShowDateSeparator(currentMsg: TeamDiscussion, prevMsg: TeamDiscussion | null): boolean {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt!);
    const prevDate = new Date(prevMsg.createdAt!);
    return currentDate.toDateString() !== prevDate.toDateString();
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.chatContainer) {
          const element = this.chatContainer.nativeElement;
          element.scrollTop = element.scrollHeight;
        }
      });
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onMessageInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  isLoading(): boolean {
    return this.loading;
  }

  canSendMessage(): boolean {
    return !!this.newMessage.trim() && !!this.teamMemberId;
  }

  handleError(error: any, action: string): void {
    console.error(`Error ${action}:`, error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to ${action.toLowerCase()}`
    });
  }

  refreshDiscussions(): void {
    this.loadDiscussions();
  }

  formatMessageContent(message: string): string {
    return message;
  }

  ngOnDestroy(): void {
    // Cleanup logic if needed
  }
}