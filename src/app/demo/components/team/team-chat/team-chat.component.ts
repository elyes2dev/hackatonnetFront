import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Team } from 'src/app/demo/models/team';
import { TeamMember } from 'src/app/demo/models/team-members';
import { TeamDiscussion, MessageType } from 'src/app/demo/models/team-discussion';
import { TeamService } from 'src/app/demo/services/team.service';
import { TeamMembersService } from 'src/app/demo/services/team-members.service';
import { TeamDiscussionService, ChatMessageDTO, TeamDiscussionType } from 'src/app/demo/services/team-discussion.service';
import { StorageService } from 'src/app/demo/services/storage.service';

@Component({
  selector: 'app-team-chat',
  templateUrl: './team-chat.component.html',
  styleUrls: ['./team-chat.component.scss'],
  providers: [MessageService]
})
export class TeamChatComponent implements OnInit, OnDestroy {
  team: Team | null = null;
  teamMembers: TeamMember[] = [];
  teamDiscussions: TeamDiscussion[] = [];
  currentUserTeamMemberId: number | null = null;
  currentUserId: number | null = null;
  isLoading = true;
  messageForm: FormGroup;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private teamService: TeamService,
    private teamMembersService: TeamMembersService,
    private teamDiscussionService: TeamDiscussionService,
    private storageService: StorageService,
    private messageService: MessageService
  ) {
    this.messageForm = this.fb.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.storageService.getLoggedInUserId();
    
    const teamId = this.route.snapshot.paramMap.get('teamId');
    if (teamId) {
      this.loadTeamDetails(+teamId);
    } else {
      this.router.navigate(['/teams']);
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadTeamDetails(teamId: number): void {
    this.isLoading = true;
    
    this.teamService.getTeamById(teamId).subscribe({
      next: (team) => {
        this.team = team;
        this.loadTeamMembers(teamId);
      },
      error: (error) => {
        console.error('Error fetching team details:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load team details. Please try again.'
        });
        this.isLoading = false;
      }
    });
  }

  loadTeamMembers(teamId: number): void {
    this.teamMembersService.getTeamMembersByTeamId(teamId).subscribe({
      next: (members) => {
        this.teamMembers = members;
        
        // Find current user's team member ID
        if (this.currentUserId) {
          const currentUserMember = members.find(member => member.user.id === this.currentUserId);
          if (currentUserMember) {
            this.currentUserTeamMemberId = currentUserMember.id;
            this.loadTeamDiscussions(teamId);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Access Denied',
              detail: 'You are not a member of this team.'
            });
            this.router.navigate(['/teams']);
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Authentication Required',
            detail: 'Please log in to access team chat.'
          });
          this.router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        console.error('Error fetching team members:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load team members. Please try again.'
        });
        this.isLoading = false;
      }
    });
  }

  loadTeamDiscussions(teamId: number): void {
    this.teamDiscussionService.getTeamDiscussions(teamId).subscribe({
      next: (discussions) => {
        this.teamDiscussions = discussions;
        this.isLoading = false;
        
        // Mark unread messages as read
        this.markMessagesAsRead();
        
        // Scroll to bottom of chat
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
      },
      error: (error) => {
        console.error('Error fetching team discussions:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load team discussions. Please try again.'
        });
        this.isLoading = false;
      }
    });
  }

  sendMessage(): void {
    if (this.messageForm.invalid || !this.team || !this.currentUserTeamMemberId) {
      return;
    }

    const message = this.messageForm.get('message')?.value.trim();
    if (!message) {
      return;
    }

    this.teamDiscussionService.sendMessage(
      this.team.id,
      this.currentUserTeamMemberId,
      message
    ).subscribe({
      next: (response) => {
        // Add the new message to the discussions list
        if (this.team) {
          this.loadTeamDiscussions(this.team.id);
        }
        
        // Clear the message input
        this.messageForm.reset();
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to send message. Please try again.'
        });
      }
    });
  }

  markMessagesAsRead(): void {
    // Mark unread messages as read
    const unreadMessages = this.teamDiscussions.filter(discussion => !discussion.isRead);
    
    unreadMessages.forEach(message => {
      this.teamDiscussionService.markAsRead(message.id).subscribe({
        error: (error) => {
          console.error('Error marking message as read:', error);
        }
      });
    });
  }

  deleteMessage(discussionId: number): void {
    this.teamDiscussionService.deleteDiscussion(discussionId).subscribe({
      next: () => {
        // Remove the message from the discussions list
        this.teamDiscussions = this.teamDiscussions.filter(discussion => discussion.id !== discussionId);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Message deleted successfully'
        });
      },
      error: (error) => {
        console.error('Error deleting message:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete message. Please try again.'
        });
      }
    });
  }

  getMemberName(teamMemberId: number): string {
    const member = this.teamMembers.find(m => m.id === teamMemberId);
    if (!member || !member.user) return 'Unknown User';
    
    // Check if user object has name and lastname
    if (member.user.name && member.user.lastname) {
      return `${member.user.name} ${member.user.lastname}`;
    }
    
    // Check if user has just name
    if (member.user.name) {
      return member.user.name;
    }
    
    // Check if user has email as fallback
    if (member.user.email) {
      return member.user.email;
    }
    
    return 'Unknown User';
  }

  isCurrentUserMessage(teamMemberId: number): boolean {
    return teamMemberId === this.currentUserTeamMemberId;
  }

  scrollToBottom(): void {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  goBack(): void {
    if (this.team) {
      this.router.navigate(['/teams', this.team.id]);
    } else {
      this.router.navigate(['/teams']);
    }
  }

  // Helper method to get the first letter for avatar
  getUserAvatarLabel(teamMemberId: number): string {
    const member = this.teamMembers.find(m => m.id === teamMemberId);
    if (!member || !member.user) return '?';
    
    if (member.user.name) {
      return member.user.name.charAt(0);
    }
    
    if (member.user.email) {
      return member.user.email.charAt(0);
    }
    
    return '?';
  }
}
