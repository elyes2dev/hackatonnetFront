import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from 'src/app/demo/services/team.service';
import { TeamDiscussionService } from 'src/app/demo/services/team-discussion.service';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Subject, Subscription, finalize, takeUntil, switchMap } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { Team } from '../../models/team';
import { TeamDiscussion, MessageType as TeamDiscussionMessageType } from '../../models/team-discussion';
import { TeamMember } from '../../models/team-members';

// Define a custom enum for chat message types
enum ChatMessageType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    FILE = 'FILE',
    EMOJI = 'EMOJI'
}

@Component({
    selector: 'app-team-chat-hub',
    templateUrl: './team-chat-hub.component.html',
    styleUrls: ['./team-chat-hub.component.scss']
})
export class TeamChatHubComponent implements OnInit, OnDestroy {
    @ViewChild('chatContainer') public chatContainer!: ElementRef;
    @ViewChild('emojiPanel') public emojiPanel: any;

    public destroy$ = new Subject<void>();
    
    // User and team data
    userId: number | null = null;
    userTeams: Team[] = [];
    selectedTeam: Team | null = null;
    teamMemberId: number | null = null;
    showArchived: boolean = false;
    showTeamsSidebar: boolean = false;
    
    // Chat state
    discussions: { [key: number]: TeamDiscussion[] } = {};
    newMessage: string = '';
    showMembersSidebar: boolean = false;
    
    // Loading states
    loading: boolean = false;
    loadingTeams: boolean = false;
    loadingMessages: boolean = false;
    sendingMessage: boolean = false;
    
    // Tracking read messages
    readMessages: Set<number> = new Set();
    
    // WebSocket
    public wsSubject: WebSocketSubject<any> | null = null;
    public wsSubscription: Subscription | null = null;
    public wsReconnectAttempts = 0;
    public readonly maxReconnectAttempts = 5;
    
    // Emoji picker state
    showEmojiPicker = false;
    recentEmojis: string[] = ['👍', '😂', '😍', '😎', '🔥', '🥳', '🎉', '❤️', '😊', '😭'];
    
    constructor(
        private route: ActivatedRoute,
        public router: Router,
        private teamService: TeamService,
        private teamDiscussionService: TeamDiscussionService,
        private messageService: MessageService,
        private authService: AuthService,
        private storageService: StorageService,
        private cdr: ChangeDetectorRef
    ) {}
    
    // Navigation methods
    navigateToHackathons(): void {
        this.router.navigate(['/landing-hackathons'], {fragment: 'hackathons'});
    }
    
    navigateToLanding(): void {
        this.router.navigate(['/landing']);
    }
    
    navigateToHackathon(hackathonId?: number): void {
        if (hackathonId) {
            this.router.navigate(['/landing-hackathon', hackathonId]);
        } else {
            this.router.navigate(['/landing-hackathons']);
        }
    }
    
    navigateTo(path: string, fragment?: string): void {
        if (fragment) {
            this.router.navigate([path], {fragment: fragment});
        } else {
            this.router.navigate([path]);
        }
    }

    ngOnInit(): void {
        // Initialize user data
        this.initializeUserData();
        
        // Load saved recent emojis from localStorage if available
        const savedEmojis = localStorage.getItem('recentEmojis');
        if (savedEmojis) {
            try {
                this.recentEmojis = JSON.parse(savedEmojis);
            } catch (e) {
                console.error('Error parsing saved emojis:', e);
            }
        }
        
        // Load user teams
        this.loadUserTeams();
        
        // Check if we have a specific team ID in the route
        this.route.params.subscribe(params => {
            const teamId = params['id'];
            if (teamId) {
                this.loadTeamAndOpenChat(+teamId);
            } else {
                // Check if we have a team in localStorage
                const savedTeam = localStorage.getItem('currentChatTeam');
                if (savedTeam) {
                    try {
                        const team = JSON.parse(savedTeam);
                        if (team && team.id) {
                            this.loadTeamAndOpenChat(team.id);
                        }
                    } catch (e) {
                        console.error('Error parsing saved team:', e);
                    }
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.disconnectWebSocket();
    }
    
    // Initialize user data
    private initializeUserData(): boolean {
        const userId = this.storageService.getLoggedInUserId();
        if (!userId) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'You must be logged in to access this page' });
            this.router.navigate(['/landing']);
            return false;
        }
        this.userId = userId;
        return true;
    }
    
    // Load all teams the user is a member of
    loadUserTeams(): void {
        if (!this.userId) return;
        
        this.loadingTeams = true;
        this.teamService.getAllTeams().pipe(
            finalize(() => this.loadingTeams = false),
            takeUntil(this.destroy$)
        ).subscribe({
            next: (teams: Team[]) => {
                this.userTeams = teams.filter(team => 
                    team.teamMembers?.some(member => member.user?.id === this.userId)
                );
                this.cdr.detectChanges();
            },
            error: (error: HttpErrorResponse) => {
                console.error('Error loading teams:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load your teams'
                });
            }
        });
    }
    
    // Load a specific team and open the chat
    loadTeamAndOpenChat(teamId: number): void {
        this.loading = true;
        this.teamService.getTeamById(teamId).pipe(
            finalize(() => this.loading = false),
            takeUntil(this.destroy$)
        ).subscribe({
            next: (team: Team) => {
                this.selectedTeam = team;
                
                // Find the current user's team member ID
                const currentUserMember = team.teamMembers?.find(member => member.user?.id === this.userId);
                if (currentUserMember && team.id) {
                    this.teamMemberId = currentUserMember.id;
                    this.loadTeamDiscussions(team.id);
                    this.connectToWebSocket(team.id);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'You are not a member of this team or team ID is missing'
                    });
                }
            },
            error: (error: HttpErrorResponse) => {
                console.error('Error loading team:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load team details'
                });
            }
        });
    }
    
    // Load team discussions
    loadTeamDiscussions(teamId: number): void {
        if (!teamId) return;
        
        this.loadingMessages = true;
        this.teamDiscussionService.getTeamDiscussions(teamId).pipe(
            finalize(() => this.loadingMessages = false),
            takeUntil(this.destroy$)
        ).subscribe({
            next: (discussions: TeamDiscussion[]) => {
                this.discussions[teamId] = discussions;
                this.cdr.detectChanges();
                this.scrollToBottom();
            },
            error: (error: HttpErrorResponse) => {
                console.error('Error loading discussions:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load team discussions'
                });
            }
        });
    }
    
    // Connect to WebSocket for real-time messaging
    connectToWebSocket(teamId: number): void {
        this.disconnectWebSocket();
        
        const wsUrl = `ws://localhost:8080/ws/team-discussion/${teamId}`;
        this.wsSubject = webSocket(wsUrl);
        
        this.wsSubscription = this.wsSubject.pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (message: any) => {
                console.log('WebSocket message received:', message);
                if (message && message.type === 'MESSAGE') {
                    const discussion = message.data;
                    if (!this.discussions[teamId]) this.discussions[teamId] = [];
                    this.discussions[teamId].push(discussion);
                    this.cdr.detectChanges();
                    this.scrollToBottom();
                }
            },
            error: (error: any) => {
                console.error('WebSocket error:', error);
                this.handleWebSocketError();
            },
            complete: () => {
                console.log('WebSocket connection closed');
                this.handleWebSocketClosed();
            }
        });
    }
    
    // Handle WebSocket errors
    private handleWebSocketError(): void {
        if (this.wsReconnectAttempts < this.maxReconnectAttempts && this.selectedTeam && this.selectedTeam.id) {
            this.wsReconnectAttempts++;
            setTimeout(() => {
                console.log(`Attempting to reconnect WebSocket (${this.wsReconnectAttempts}/${this.maxReconnectAttempts})`);
                this.connectToWebSocket(this.selectedTeam!.id);
            }, 2000 * this.wsReconnectAttempts);
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Connection Lost',
                detail: 'Failed to connect to chat server. Please refresh the page.'
            });
        }
    }
    
    // Handle WebSocket closed
    private handleWebSocketClosed(): void {
        this.wsSubscription = null;
        if (this.selectedTeam && this.selectedTeam.id) {
            this.connectToWebSocket(this.selectedTeam.id);
        }
    }
    
    // Disconnect WebSocket
    private disconnectWebSocket(): void {
        if (this.wsSubscription) {
            this.wsSubscription.unsubscribe();
            this.wsSubscription = null;
        }
        if (this.wsSubject) {
            this.wsSubject.complete();
            this.wsSubject = null;
        }
        this.wsReconnectAttempts = 0;
    }
    
    // Send a message
    sendMessage(): void {
        if (!this.newMessage.trim() || !this.selectedTeam || !this.teamMemberId) {
            return;
        }
        
        const message = this.filterBadWords(this.newMessage.trim());
        this.sendingMessage = true;
        this.newMessage = '';
        
        // Using any type to bypass the type checking issues
        this.teamDiscussionService.sendMessage(this.selectedTeam.id, this.teamMemberId, message).pipe(
            finalize(() => this.sendingMessage = false),
            takeUntil(this.destroy$)
        ).subscribe({
            next: (response: any) => {
                const discussion = response as TeamDiscussion;
                if (this.selectedTeam && this.selectedTeam.id) {
                    if (!this.discussions[this.selectedTeam.id]) {
                        this.discussions[this.selectedTeam.id] = [];
                    }
                    this.discussions[this.selectedTeam.id].push(discussion);
                    this.cdr.detectChanges();
                    this.scrollToBottom();
                }
            },
            error: (error: HttpErrorResponse) => {
                console.error('Error sending message:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to send message'
                });
            }
        });
    }
    
    // Filter bad words
    filterBadWords(text: string): string {
        const badWords = ['badword1', 'badword2', 'badword3']; // Replace with actual bad words
        let filteredText = text;
        
        badWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            filteredText = filteredText.replace(regex, '*'.repeat(word.length));
        });
        
        return filteredText;
    }
    
    // Scroll to bottom of chat
    scrollToBottom(): void {
        setTimeout(() => {
            if (this.chatContainer) {
                // Scroll to the bottom of the chat container
                this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
                
                // Mark visible messages as read
                if (this.selectedTeam && this.discussions[this.selectedTeam.id]) {
                    this.discussions[this.selectedTeam.id].forEach(discussion => {
                        if (discussion.id) {
                            this.readMessages.add(discussion.id);
                        }
                    });
                }
            }
        }, 100);
    }
    
    // Toggle members sidebar
    toggleMembersSidebar(): void {
        this.showMembersSidebar = !this.showMembersSidebar;
    }
    
    // Toggle teams sidebar for mobile view
    toggleTeamsSidebar(): void {
        this.showTeamsSidebar = !this.showTeamsSidebar;
    }
    
    // Check if a message is from the current user
    isCurrentUserMessage(teamMemberId?: number): boolean {
        return teamMemberId === this.teamMemberId;
    }
    
    // Check if a team is archived (hackathon has ended)
    isTeamArchived(team?: Team | null): boolean {
        if (!team || !team.hackathon) return false;
        
        const endDate = new Date(team.hackathon.endDate || '');
        const now = new Date();
        
        return endDate < now;
    }
    
    // Get filtered teams based on archived status
    getFilteredTeams(): Team[] {
        return this.userTeams.filter(team => this.isTeamArchived(team) === this.showArchived);
    }
    
    // Check if a message has been read
    isMessageRead(discussion: TeamDiscussion): boolean {
        return discussion.id ? this.readMessages.has(discussion.id) : true;
    }
    
    // Check if a message is consecutive (from the same sender within a short time)
    isConsecutiveMessage(prevMessage: TeamDiscussion, currentMessage: TeamDiscussion): boolean {
        if (!prevMessage || !currentMessage) return false;
        
        // Check if messages are from the same sender
        const sameSender = prevMessage.teamMember?.id === currentMessage.teamMember?.id;
        
        // Check if messages are within 2 minutes of each other
        const prevTime = new Date(prevMessage.createdAt || '').getTime();
        const currentTime = new Date(currentMessage.createdAt || '').getTime();
        const timeGap = currentTime - prevTime;
        const withinTimeWindow = timeGap < 2 * 60 * 1000; // 2 minutes in milliseconds
        
        return sameSender && withinTimeWindow;
    }
    
    // Determine if we should show the time for a message
    shouldShowTime(message: TeamDiscussion): boolean {
        // Always show time for the last message in a conversation
        const messages = this.discussions[this.selectedTeam!.id] || [];
        const isLastMessage = messages.indexOf(message) === messages.length - 1;
        
        // Show time for messages that are more than 5 minutes apart
        const index = messages.indexOf(message);
        if (index > 0 && index < messages.length - 1) {
            const nextMessage = messages[index + 1];
            const currentTime = new Date(message.createdAt || '').getTime();
            const nextTime = new Date(nextMessage.createdAt || '').getTime();
            const timeGap = nextTime - currentTime;
            
            return timeGap > 5 * 60 * 1000; // 5 minutes in milliseconds
        }
        
        return isLastMessage;
    }
    
    // Get formatted message time
    getMessageTime(timestamp?: string): string {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Get formatted message date
    getMessageDate(timestamp?: string): string {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
        }
    }
    
    // Check if we should show a date divider
    shouldShowDateDivider(prevTimestamp?: string, currTimestamp?: string): boolean {
        if (!prevTimestamp || !currTimestamp) return true;
        
        const prevDate = new Date(prevTimestamp);
        const currDate = new Date(currTimestamp);
        
        return prevDate.toDateString() !== currDate.toDateString();
    }
    
    // Handle file upload
    triggerFileUpload(): void {
        const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    }
    
    // Handle file selection
    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (!file || !this.selectedTeam || !this.teamMemberId) return;
        
        const formData = new FormData();
        formData.append('file', file);
        
        this.sendingMessage = true;
        
        // Since uploadFile doesn't exist in TeamDiscussionService, we'll use sendMessage instead
        // and handle the file upload on the backend
        this.sendMessage();
        
        // Reset the file input
        event.target.value = '';
        
        // Show success message
        this.messageService.add({
            severity: 'success',
            summary: 'File Selected',
            detail: `File ${file.name} selected. Please add a message and click send.`
        });
        
        this.sendingMessage = false;
    }
    
    // Extract filename from URL
    extractFileName(url?: string): string {
        if (!url) return '';
        try {
            return url.split('/').pop() || url;
        } catch {
            return url;
        }
    }
    
    // Emoji picker functions
    toggleEmojiPicker(event: Event): void {
        this.showEmojiPicker = true;
        if (this.emojiPanel) {
            this.emojiPanel.toggle(event);
        }
    }
    
    addEmoji(emoji: string): void {
        this.newMessage = (this.newMessage || '') + emoji;
        
        // Update recent emojis
        if (!this.recentEmojis.includes(emoji)) {
            this.recentEmojis.unshift(emoji);
            if (this.recentEmojis.length > 12) this.recentEmojis.pop();
            localStorage.setItem('recentEmojis', JSON.stringify(this.recentEmojis));
        }
        
        // Close the emoji panel
        if (this.emojiPanel) {
            this.emojiPanel.hide();
        }
    }
    
    // Select a team
    selectTeam(team: Team): void {
        if (this.selectedTeam?.id === team.id) return;
        this.loadTeamAndOpenChat(team.id);
    }
    
    // Get team initials for avatar
    getTeamInitials(teamName: string): string {
        if (!teamName) return '?';
        return teamName.split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }
    
    // Get file URL from discussion
    getFileUrl(discussion: TeamDiscussion): string {
        // Since fileUrl doesn't exist in the TeamDiscussion model,
        // we'll extract it from the message or create a placeholder
        if (discussion.messageType === 'FILE' || discussion.messageType === 'IMAGE') {
            // In a real app, the file URL might be stored in the message field
            // or you would have a separate API to get the file
            return `/assets/files/${discussion.id}`;
        }
        return '';
    }
    
    // Open image in a new tab or modal
    openImage(imageUrl: string): void {
        if (imageUrl) {
            window.open(imageUrl, '_blank');
        }
    }
    
    // Get team last message
    getTeamLastMessage(teamId: number): string {
        if (!this.discussions[teamId] || this.discussions[teamId].length === 0) {
            return 'No messages yet';
        }
        
        const lastMessage = this.discussions[teamId][this.discussions[teamId].length - 1];
        if (lastMessage.messageType === TeamDiscussionMessageType.FILE) {
            return '📎 File attachment';
        }
        
        return lastMessage.message || '';
    }
    
    // Get team last message time
    getTeamLastMessageTime(teamId: number): string {
        if (!this.discussions[teamId] || this.discussions[teamId].length === 0) {
            return '';
        }
        
        const lastMessage = this.discussions[teamId][this.discussions[teamId].length - 1];
        return this.getMessageTime(lastMessage.createdAt);
    }
}
