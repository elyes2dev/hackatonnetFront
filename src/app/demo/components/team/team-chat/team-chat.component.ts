import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, MenuItem } from 'primeng/api';
import { Subscription, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Menu } from 'primeng/menu';
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
export class TeamChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatMessages') chatMessagesRef!: ElementRef;
  @ViewChild('messageMenu') messageMenu!: Menu;
  @ViewChild('attachmentMenu') attachmentMenu!: Menu;
  
  team: Team | null = null;
  teamMembers: TeamMember[] = [];
  teamDiscussions: TeamDiscussion[] = [];
  groupedDiscussions: Map<string, any[]> = new Map();
  currentUserTeamMemberId: number | null = null;
  currentUserId: number | null = null;
  isLoading = true;
  messageForm: FormGroup;
  private subscriptions: Subscription[] = [];
  
  // Emoji picker
  showEmojiPicker = false;
  selectedEmojiCategory = 'smileys';
  emojiCategories = [
    { name: 'smileys', icon: 'pi-smile' },
    { name: 'people', icon: 'pi-user' },
    { name: 'animals', icon: 'pi-heart' },
    { name: 'food', icon: 'pi-apple' },
    { name: 'activities', icon: 'pi-star' },
    { name: 'travel', icon: 'pi-car' },
    { name: 'objects', icon: 'pi-desktop' },
    { name: 'symbols', icon: 'pi-flag' }
  ];
  
  // Common emojis by category
  emojis = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘'],
    people: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧'],
    food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏'],
    travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛴', '🚲'],
    objects: ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖']
  };
  filteredEmojis: string[] = this.emojis.smileys;
  
  // Team members sidebar
  showMembersSidebar = false;
  
  // Message menu items
  messageMenuItems: MenuItem[] = [];
  selectedMessage: TeamDiscussion | null = null;
  
  // Attachment menu items
  attachmentMenuItems: MenuItem[] = [];
  
  // Auto refresh
  private autoRefreshActive = true;
  private refreshInterval: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private teamService: TeamService,
    private teamMembersService: TeamMembersService,
    private teamDiscussionService: TeamDiscussionService,
    private storageService: StorageService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {
    this.messageForm = this.fb.group({
      message: ['', Validators.required]
    });
    
    // Initialize message menu items
    this.messageMenuItems = [
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
          if (this.selectedMessage) {
            this.deleteMessage(this.selectedMessage.id);
          }
        }
      },
      {
        label: 'Copy Text',
        icon: 'pi pi-copy',
        command: () => {
          if (this.selectedMessage) {
            this.copyMessageText(this.selectedMessage.message);
          }
        }
      }
    ];
    
    // Initialize attachment menu items
    this.attachmentMenuItems = [
      {
        label: 'Upload File',
        icon: 'pi pi-file',
        command: () => {
          // To be implemented in future
          this.messageService.add({
            severity: 'info',
            summary: 'Coming Soon',
            detail: 'File upload will be available in a future update.'
          });
        }
      },
      {
        label: 'Share Location',
        icon: 'pi pi-map-marker',
        command: () => {
          // To be implemented in future
          this.messageService.add({
            severity: 'info',
            summary: 'Coming Soon',
            detail: 'Location sharing will be available in a future update.'
          });
        }
      }
    ];
  }

  ngOnInit(): void {
    this.currentUserId = this.storageService.getLoggedInUserId();
    
    const teamId = this.route.snapshot.paramMap.get('teamId');
    if (teamId) {
      this.loadTeamDetails(+teamId);
      this.startAutoRefresh(+teamId);
    } else {
      this.router.navigate(['/teams']);
    }
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.emoji-picker-container') && !target.closest('.pi-smile')) {
        this.showEmojiPicker = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Stop auto refresh
    this.autoRefreshActive = false;
    if (this.refreshInterval) {
      this.refreshInterval.unsubscribe();
    }
    
    // Remove event listeners
    document.removeEventListener('click', () => {});
  }
  
  ngAfterViewChecked(): void {
    // Scroll to bottom when messages change
    this.scrollToBottom();
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
        
        // Group messages by date and sender
        this.groupMessages(discussions);
        
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
  
  /**
   * Group messages by date and then by sender for better display
   */
  groupMessages(discussions: TeamDiscussion[]): void {
    // Sort discussions by date
    const sortedDiscussions = [...discussions].sort((a, b) => {
      // Ensure we have valid dates
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
    
    // Clear existing groups
    this.groupedDiscussions = new Map<string, any[]>();
    
    // Group by date
    sortedDiscussions.forEach(message => {
      // Ensure we have a valid date
      if (!message.createdAt) {
        return; // Skip messages without a creation date
      }
      
      const messageDate = new Date(message.createdAt);
      const dateKey = this.formatDateForGrouping(messageDate);
      
      if (!this.groupedDiscussions.has(dateKey)) {
        this.groupedDiscussions.set(dateKey, []);
      }
      
      const dateGroup = this.groupedDiscussions.get(dateKey);
      
      // Find or create a message group for this sender
      const memberId = message.teamMember?.id || 0;
      let group = dateGroup?.find(g => g.memberId === memberId && 
                                  this.messageTimeClose(g.lastMessageTime, messageDate));
      
      if (!group) {
        group = {
          memberId: memberId,
          messages: [],
          lastMessageTime: messageDate
        };
        dateGroup?.push(group);
      } else {
        // Update the last message time
        group.lastMessageTime = messageDate;
      }
      
      // Add message to group
      group.messages.push(message);
    });
  }
  
  /**
   * Format date for grouping (Today, Yesterday, or MM/DD/YYYY)
   */
  formatDateForGrouping(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }
  
  /**
   * Check if two message times are close enough to be in the same group (within 5 minutes)
   */
  messageTimeClose(time1: Date, time2: Date): boolean {
    if (!time1 || !time2) return false;
    const diff = Math.abs(time1.getTime() - time2.getTime());
    const minutes = diff / (1000 * 60);
    return minutes < 5;
  }
  
  /**
   * Start auto-refresh for messages
   */
  startAutoRefresh(teamId: number): void {
    this.refreshInterval = interval(10000) // Refresh every 10 seconds
      .pipe(takeWhile(() => this.autoRefreshActive))
      .subscribe(() => {
        if (this.team) {
          this.refreshMessages(teamId);
        }
      });
  }
  
  /**
   * Refresh messages without changing loading state
   */
  refreshMessages(teamId: number): void {
    this.teamDiscussionService.getTeamDiscussions(teamId).subscribe({
      next: (discussions) => {
        // Only update if there are new messages
        if (discussions.length > this.teamDiscussions.length) {
          this.teamDiscussions = discussions;
          this.groupMessages(discussions);
          this.markMessagesAsRead();
        }
      },
      error: (error) => {
        console.error('Error refreshing team discussions:', error);
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
        
        // Close emoji picker if open
        this.showEmojiPicker = false;
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
    if (this.chatMessagesRef && this.chatMessagesRef.nativeElement) {
      const chatContainer = this.chatMessagesRef.nativeElement;
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
      return member.user.name.charAt(0).toUpperCase();
    }
    
    if (member.user.email) {
      return member.user.email.charAt(0).toUpperCase();
    }
    
    return '?';
  }
  
  /**
   * Get color based on member role
   */
  getMemberRoleColor(teamMemberId: number): string {
    const member = this.teamMembers.find(m => m.id === teamMemberId);
    if (!member) return '#2196F3';
    
    switch (member.role) {
      case 'LEADER': return '#FFD700';
      case 'MENTOR': return '#9C27B0';
      default: return '#2196F3';
    }
  }
  
  /**
   * Format message text to handle URLs, emojis, etc.
   */
  formatMessage(text: string): SafeHtml {
    if (!text) return '';
    
    // Replace URLs with clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const formattedText = text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
    
    return this.sanitizer.bypassSecurityTrustHtml(formattedText);
  }
  
  /**
   * Toggle emoji picker
   */
  toggleEmojiPicker(event: Event): void {
    event.stopPropagation();
    this.showEmojiPicker = !this.showEmojiPicker;
  }
  
  /**
   * Select emoji category
   */
  selectEmojiCategory(category: string): void {
    this.selectedEmojiCategory = category;
    this.filteredEmojis = this.emojis[category as keyof typeof this.emojis] || [];
  }
  
  /**
   * Insert emoji into message input
   */
  insertEmoji(emoji: string): void {
    const messageControl = this.messageForm.get('message');
    const currentValue = messageControl?.value || '';
    messageControl?.setValue(currentValue + emoji);
  }
  
  /**
   * Toggle team members sidebar
   */
  toggleMembersSidebar(): void {
    this.showMembersSidebar = !this.showMembersSidebar;
  }
  
  /**
   * Check if user is online (placeholder for future implementation)
   */
  isUserOnline(userId: number | undefined): boolean {
    // This would be replaced with actual online status logic
    // For now, randomly show some users as online for demo purposes
    if (!userId) return false;
    return userId % 3 === 0; // Just a simple way to show some users as online
  }
  
  /**
   * Start direct chat with team member (placeholder for future implementation)
   */
  startDirectChat(teamMemberId: number): void {
    const member = this.teamMembers.find(m => m.id === teamMemberId);
    if (!member) return;
    
    this.messageService.add({
      severity: 'info',
      summary: 'Coming Soon',
      detail: `Direct messaging with ${this.getMemberName(teamMemberId)} will be available in a future update.`
    });
  }
  
  /**
   * Toggle message context menu
   */
  toggleMessageMenu(event: Event, message: TeamDiscussion): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectedMessage = message;
    this.messageMenu.toggle(event);
  }
  
  /**
   * Toggle attachment menu
   */
  toggleAttachmentMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.attachmentMenu.toggle(event);
  }
  
  /**
   * Copy message text to clipboard
   */
  copyMessageText(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'Message copied to clipboard'
      });
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  }
}
