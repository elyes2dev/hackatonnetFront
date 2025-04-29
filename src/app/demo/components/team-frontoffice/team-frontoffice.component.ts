import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TeamService } from 'src/app/demo/services/team.service';
import { TeamDiscussionService } from 'src/app/demo/services/team-discussion.service';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { finalize, takeUntil, switchMap, retry, timeout } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { HackathonService } from '../../services/hackathon/hackathon.service';
import { StorageService } from '../../services/storage.service';
import { Hackathon } from '../../models/hackathon';
import { Team } from '../../models/team';
import { TeamDiscussion, MessageType as TeamDiscussionMessageType } from '../../models/team-discussion';
import { TeamMember } from '../../models/team-members';
import { GeminiAIService, GeminiResponse } from '../../services/gemini-ai.service';

interface DialogState {
    participate: boolean;
    create: boolean;
    join: boolean;
    conversation: boolean;
    success: boolean;
}

// Define a custom enum for chat message types
enum ChatMessageType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    FILE = 'FILE'
}

// Define the ChatMessage interface for team chat
interface ChatMessage {
    id: number;
    content: string;
    sender: TeamMember;
    createdAt: Date;
    isRead: boolean;
    teamId: number;
    teamMemberId: number;
    attachmentUrl: string | null;
    attachmentType: string | null;
    reactions: any[];
}

// Extend TeamDiscussion to include Gemini-specific properties
interface GeminiTeamDiscussion extends TeamDiscussion {
    isAI?: boolean;
    isLoading?: boolean;
}

// We no longer need these since we updated the TeamMember interface
// to include the GEMINI role

import { Observable, of } from 'rxjs';

@Component({
    selector: 'app-team-frontoffice',
    templateUrl: './team-frontoffice.component.html',
    styleUrls: ['./team-frontoffice.component.scss', './gemini-chat.scss']
})
export class TeamFrontofficeComponent implements OnInit, OnDestroy {
    readonly currentDateTime: string = '2025-04-16 13:04:48';
    readonly currentUserLogin: string = 'ramroumaa';

    @ViewChild('chatContainer') public chatContainer!: ElementRef;

    public dialogState$ = new BehaviorSubject<DialogState>({
        participate: false,
        create: false,
        join: false,
        conversation: false,
        success: false
    });
    
    // Messages array for chat
    public messages: TeamDiscussion[] = [];
    
    // Current team member reference
    public currentTeamMember: TeamMember | null = null;
    
    // AI assistant team member reference
    private aiTeamMember: TeamMember | null = null;

    public destroy$ = new Subject<void>();

    get participateDialog(): boolean { return this.dialogState$.value.participate; }
    get createTeamDialog(): boolean { return this.dialogState$.value.create; }
    get joinTeamDialog(): boolean { return this.dialogState$.value.join; }
    get conversationDialog(): boolean { return this.dialogState$.value.conversation; }
    get isAnyDialogOpen(): boolean {
        return Object.values(this.dialogState$.value).some(value => value);
    }
    
    // Helper methods for UI feedback
    public showSuccess(message: string): void {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
    }

    public showError(message: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
    }

    hackathonId: string;
    selectedHackathon: Hackathon | null = null;
    team: Partial<Team> = {};
    selectedTeam: Team | null = null;
    publicTeams: Team[] = [];
    discussions: { [key: number]: TeamDiscussion[] } = {};

    submitted: boolean = false;
    loading: boolean = false;
    loadingTeamMember: boolean = false;
    loadingPublicTeams: boolean = false;
    loadingMessages: boolean = false;
    sendingMessage: boolean = false;

    userId: number | null = null;
    teamMemberId: number | null = null;
    teamCode: string = '';
    newMessage: string = '';
    public pinnedMessages: TeamDiscussion[] = [];

    public wsSubject: WebSocketSubject<any> | null = null;
    public wsSubscription: Subscription | null = null;
    public wsReconnectAttempts = 0;
    public readonly maxReconnectAttempts = 5;
    private pollingInterval: any = null;
    private readonly pollingIntervalTime: number = 5000; // 5 seconds polling interval

    createdTeamCode: string = '';
    showSuccessDialog: boolean = false;
    
    // Chat sidebar state
    showChatView: boolean = false;

    // Gemini Chat properties
    geminiActive: boolean = false;
    geminiLoading: boolean = false;
    geminiResponse: string = '';
    geminiPrompt: string = '';
    geminiChatHistory: Array<{role: string, content: string}> = [];
    @ViewChild('geminiChatContainer') geminiChatContainer!: ElementRef;

    // Bad words filter (simple)
    private badWords = [
        'badword1', 'badword2', 'shit', 'fuck', 'bitch', 'asshole', 'idiot', 'damn', 'crap', 'dick', 'bastard', 'fag', 'slut', 'whore', 'douche', 'cunt', 'piss', 'prick', 'wank', 'twat', 'bollocks', 'bugger', 'arse', 'bloody', 'sod', 'git', 'wanker', 'jerk', 'moron', 'jackass', 'retard', 'suck', 'screwed', 'darn', 'hell', 'freak', 'loser', 'douchebag', 'motherfucker', 'nigger', 'nigga', 'retarded', 'gay', 'homo', 'queer', 'dyke', 'tranny', 'spaz', 'spastic', 'mong', 'gook', 'chink', 'kike', 'spic', 'wetback', 'beaner', 'tard', 'coon', 'raghead', 'camel jockey', 'sand nigger', 'zipperhead', 'gyp', 'gypsy', 'paki', 'paddy', 'mick', 'kraut', 'nip', 'yid', 'yiddo', 'wop', 'dago', 'greaseball', 'goombah', 'guido', 'mulatto', 'octaroon', 'quadroon', 'redskin', 'squaw', 'injun', 'sambo', 'pickaninny', 'jigaboo', 'porch monkey', 'tar baby', 'mammy', 'buck', 'coonass', 'cracker', 'hillbilly', 'hick', 'peckerwood', 'white trash', 'yokel', 'yuppie', 'zip coon', 'zulu'
    ]

    // Helper method to scroll chat to bottom
    scrollToBottom(): void {
        setTimeout(() => {
            if (this.chatContainer?.nativeElement) {
                const element = this.chatContainer.nativeElement;
                element.scrollTop = element.scrollHeight;
                console.log('Scrolled to bottom, scrollHeight:', element.scrollHeight);
            } else {
                console.warn('Chat container not found');
            }
        }, 100);
    };

    /**
     * Public version of handleAICommand for backward compatibility
     * @param prompt The prompt text from the user
     */
    public handleAICommandPublic(prompt: string): void {
        console.log('Public handleAICommand called with prompt:', prompt);
        // Simply delegate to the private implementation
        this.handleAICommand(prompt);
    }
    
    // Filter bad words from text
    filterBadWords(text: string): string {
        if (!text) return '';
        
        let filteredText = text;
        this.badWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            filteredText = filteredText.replace(regex, '*'.repeat(word.length));
        });
        
        return filteredText;
    }

    constructor(
        public teamService: TeamService,
        public teamDiscussionService: TeamDiscussionService,
        public messageService: MessageService,
        public authService: AuthService,
        public cdr: ChangeDetectorRef,
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private hackathonService: HackathonService,
        private storageService: StorageService,
        private geminiAIService: GeminiAIService
    ) {
        this.hackathonId = this.config?.data?.hackathonId || '';
    }

    public initializeDialogState(): void {
        if (this.isAnyDialogOpen) {
            console.log('Dialog already open, skipping initialization');
            return;
        }
        console.log('Initializing dialog state with mode:', this.config?.data?.mode);
        if (this.config?.data?.mode === 'chat' && this.config?.data?.teamId) {
            this.selectedTeam = { id: this.config.data.teamId } as Team;
            this.setDialogState({ conversation: true });
        } else if (this.config?.data?.mode === 'participate') {
            this.setDialogState({ participate: true });
        }
    }

    ngOnInit(): void {
        if (!this.initializeUserData()) {
            this.ref.close();
            return;
        }

        this.initializeDialogState();
        this.loadHackathon();

        if (this.config?.data?.mode === 'chat' && this.config?.data?.teamId) {
            this.loadingTeamMember = true;
            console.log('Fetching team member for teamId:', this.config.data.teamId);
            this.getTeamMemberId(this.config.data.teamId);
            
            // Automatically open chat view when mode is 'chat'
            setTimeout(() => {
                this.showChatView = true;
                this.scrollToBottom();
            }, 300);
        }

        this.dialogState$.pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.detectChanges());
    }

    private loadHackathon(): void {
        if (!this.hackathonId) return;

        this.hackathonService.getHackathonById(this.hackathonId).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (hackathon) => {
                this.selectedHackathon = hackathon;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Failed to load hackathon:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load hackathon details'
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.cleanupWebSocket();
    }

    public setDialogState(newState: Partial<DialogState>): void {
        console.log('Setting dialog state:', newState);
        this.dialogState$.next({
            participate: false,
            create: false,
            join: false,
            conversation: false,
            success: false,
            ...newState
        });
    }

    public closeAllDialogs(): void {
        console.log('Closing all dialogs');
        this.setDialogState({});
        this.resetDialogData();
    }

    public resetDialogData(): void {
        this.team = {};
        this.teamCode = '';
        this.newMessage = '';
        this.submitted = false;
        this.loadingTeamMember = false;
        this.loadingPublicTeams = false;
        this.loadingMessages = false;
        this.sendingMessage = false;
    }

    public initializeUserData(): boolean {
        if (!this.authService.isAuthenticated()) {
            console.error('Invalid token, closing dialog');
            return false;
        }
        this.userId = this.storageService.getLoggedInUserId() as number;
        console.log('Initialized userId:', this.userId);
        return true;
    }

    handleDialogHide(): void {
        console.log('Handling dialog hide, mode:', this.config?.data?.mode);
        this.closeAllDialogs();
        this.ref.close();
    }

    setParticipateDialog(value: boolean): void {
        console.log('Setting participate dialog:', value);
        if (!value && this.loading) return;

        if (!value) {
            this.handleDialogHide();
        } else {
            if (!this.initializeUserData()) {
                console.log('Participate dialog blocked: invalid user data');
                return;
            }
            this.setDialogState({ participate: true });
        }
    }

    openCreateTeamDialog(): void {
        if (this.loading) {
            console.log('Create team dialog blocked: loading');
            return;
        }

        this.resetDialogData();
        this.setDialogState({ create: true });
    }

    openJoinTeamDialog(): void {
        if (this.loading) {
            console.log('Join team dialog blocked: loading');
            return;
        }

        this.resetDialogData();
        this.setDialogState({ join: true });
        this.loadPublicTeams();
    }

    hideConversationDialog(): void {
        console.log('Hiding conversation dialog');
        this.cleanupWebSocket();
        this.setDialogState({});
        this.selectedTeam = null;
        this.newMessage = '';
        this.ref.close();
    }

    loadPublicTeams(): void {
        this.loadingPublicTeams = true;
        this.teamService.getAvailablePublicTeams().pipe(
            takeUntil(this.destroy$),
            finalize(() => {
                this.loadingPublicTeams = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (teams) => {
                this.publicTeams = teams.filter(team =>
                    team.hackathon?.id === parseInt(this.hackathonId) &&
                    !team.isFull &&
                    team.isPublic === true
                );
                console.log('Loaded public teams:', this.publicTeams);
                if (!this.publicTeams.length) {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Info',
                        detail: 'No public teams available for this hackathon'
                    });
                }
            },
            error: (error: HttpErrorResponse) => {
                console.error('Failed to load public teams:', error);
            }
        });
    }

    public handleTeamSuccess(team: Team): void {
        console.log('Team success:', team);
        this.closeAllDialogs();
        this.ref.close(team);
    }

    createTeam(): void {
        this.submitted = true;
        if (!this.team.teamName?.trim()) {
            console.error('Team name is required');
            return;
        }

        this.loading = true;
        this.teamService.createTeam(this.team, parseInt(this.hackathonId)).pipe(
            takeUntil(this.destroy$),
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (team) => {
                this.createdTeamCode = team.teamCode || '';
                this.setDialogState({ success: true });
                this.showSuccessDialog = true;
                
                // Set a timeout to refresh the page after showing the success dialog
                setTimeout(() => {
                    window.location.reload();
                }, 3000); // Refresh after 3 seconds to give user time to see the success message
            },
            error: (error: HttpErrorResponse) => {
                console.error('Failed to create team:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to create team. Please try again.'
                });
            }
        });
    }

    copyTeamCode(): void {
        if (this.createdTeamCode) {
            navigator.clipboard.writeText(this.createdTeamCode).then(() => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Team code copied to clipboard!'
                });
            }).catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to copy team code'
                });
            });
        }
    }

    closeSuccessDialog(): void {
        this.showSuccessDialog = false;
        this.setDialogState({});
        this.ref.close();
    }

    joinTeamByCode(): void {
        if (!this.teamCode.trim()) {
            this.showError('Team code is required');
            return;
        }

        this.loading = true;

        // Since the service expects a teamId, we need to find the team by code first
        // For now, we'll use a workaround by modifying the service call
        // This would need a proper API endpoint to join by code
        this.teamService.joinTeamByCode(this.teamCode.trim(), this.userId!).pipe(
            takeUntil(this.destroy$),
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (team) => {
                console.log('Successfully joined team:', team);
                this.showSuccess(`Successfully joined team "${team.teamName}"`);
                this.handleTeamSuccess(team);
            },
            error: (error: HttpErrorResponse) => {
                console.error('Failed to join team:', error);
                if (error.status === 409) {
                    this.showError('Team is full or you are already a member of this team.');
                } else if (error.status === 400) {
                    const errorMessage = error.error?.error || error.error?.message || 'Failed to join team';
                    if (errorMessage.toLowerCase().includes('expired')) {
                        this.showError('Team code has expired. Please contact the team leader for a new code.');
                    } else if (errorMessage.toLowerCase().includes('invalid')) {
                        this.showError('Invalid team code. Please check the code and try again.');
                    } else {
                        this.showError(errorMessage);
                    }
                } else {
                    this.showError('Failed to join team. Please try again later.');
                }
            }
        });
    }

    joinPublicTeam(team: Team): void {
        if (!team.teamCode || !team.id) {
            this.showError('Invalid team code');
            return;
        }

        this.loading = true;
        this.teamService.joinTeam(team.id).pipe(
            takeUntil(this.destroy$),
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (joinedTeam) => {
                console.log('Successfully joined public team:', joinedTeam);
                this.showSuccess(`Successfully joined team "${joinedTeam.teamName}"`);
                // Open chat automatically after joining
                this.selectedTeam = joinedTeam;
                this.setDialogState({ conversation: true });
                this.getTeamMemberId(joinedTeam.id!);
            },
            error: (error: HttpErrorResponse) => {
                console.error('Failed to join team:', error);
                this.showError(error.error?.message || 'Failed to join team. The team might be full or no longer available.');
            }
        });
    }

    joinAnyAvailableTeam(): void {
        if (!this.publicTeams.length) {
            this.showError('No available teams to join.');
            return;
        }
        const availableTeam = this.publicTeams.find(team => !team.isFull);
        if (availableTeam) {
            this.joinPublicTeam(availableTeam);
        } else {
            this.showError('No available teams to join.');
        }
    }

    public getTeamMemberId(teamId: number): void {
        if (!this.userId) {
            console.error('User information missing');
            this.hideConversationDialog();
            return;
        }

        console.log('Getting team member for teamId:', teamId, 'userId:', this.userId);
        this.teamService.getTeamById(teamId).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (team) => {
                console.log('Team data:', team);
                const teamMember = team.teamMembers?.find(member => member.user?.id === this.userId);
                if (teamMember?.id && teamMember.user?.name) {
                    this.teamMemberId = teamMember.id;
                    this.selectedTeam = team;
                    console.log('Set teamMemberId:', this.teamMemberId, 'selectedTeam:', this.selectedTeam);
                    
                    // Find or initialize the AI team member
                    this.initializeAITeamMember(team);
                    
                    this.loadTeamDiscussions(teamId);
                    this.initializeWebSocket(teamId);
                } else {
                    this.teamMemberId = null;
                    console.warn('User not a team member or missing username');
                    this.hideConversationDialog();
                }
            },
            error: (error) => {
                console.error('Failed to get team member information:', error);
                // Silently handle the error without showing notification
                this.hideConversationDialog();
            },
            complete: () => {
                this.loadingTeamMember = false;
                this.cdr.detectChanges();
                console.log('getTeamMemberId complete');
            }
        });
    }
    
    /**
     * Initialize the AI team member for the current team
     * This creates a persistent AI team member that can be used to save messages to the database
     */
    private initializeAITeamMember(team: Team): void {
        // Look for an existing AI team member in the team
        const aiMember = team.teamMembers?.find(member => member.role === 'GEMINI');
        
        if (aiMember) {
            console.log('Found existing AI team member:', aiMember);
            this.aiTeamMember = aiMember;
        } else {
            console.log('No AI team member found, using fallback approach');
            // Create a virtual AI team member as a fallback
            this.aiTeamMember = {
                id: -999, // Special ID for AI (will be replaced with actual ID if available)
                user: {
                    id: -999,
                    name: 'Gemini Assistant',
                    lastname: '',
                    email: 'ai-assistant@system.local'
                },
                team: team,
                role: 'GEMINI'
            } as TeamMember;
        }
        
        console.log('AI team member initialized:', this.aiTeamMember);
    }

    getDiscussions(teamId: number): TeamDiscussion[] {
        return this.discussions[teamId] || [];
    }

    getTeamCode(): string {
        return this.selectedTeam?.teamCode || '';
    }

    loadTeamDiscussions(teamId: number): void {
        this.loadingMessages = true;
        console.log('Loading discussions for teamId:', teamId);
        this.teamDiscussionService.getTeamDiscussions(teamId).pipe(
            takeUntil(this.destroy$),
            finalize(() => {
                this.loadingMessages = false;
                this.cdr.detectChanges();
                console.log('loadTeamDiscussions finalize');
            })
        ).subscribe({
            next: async (data) => {
                console.log('Received discussions data:', data);
                let discussions: TeamDiscussion[] = [];
                if (data instanceof Blob) {
                    try {
                        const text = await data.text();
                        discussions = JSON.parse(text) as TeamDiscussion[];
                        console.log('Parsed Blob to discussions:', discussions);
                    } catch (error) {
                        console.error('Error parsing Blob:', error);
                        discussions = [];
                    }
                } else if (Array.isArray(data)) {
                    discussions = data;
                    console.log('Received array of discussions:', discussions);
                } else {
                    console.warn('Unexpected data format:', data);
                }
                
                // Preserve AI messages when refreshing discussions
                const existingDiscussions = this.discussions[teamId] || [];
                const aiMessages = existingDiscussions.filter(msg => 
                    (msg as GeminiTeamDiscussion).isAI === true || 
                    (msg.teamMember?.role === 'GEMINI')
                );
                
                // Combine server discussions with AI messages
                this.discussions[teamId] = [...discussions, ...aiMessages];
                
                // Remove duplicates (in case an AI message was saved to the server)
                this.discussions[teamId] = this.discussions[teamId].filter((msg, index, self) => 
                    index === self.findIndex(m => m.id === msg.id)
                );
                
                // Sort by creation time (oldest first, newest last)
                this.discussions[teamId].sort((a, b) => {
                    // Handle potential undefined values with fallbacks
                    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return timeA - timeB; // Ascending order (oldest first, newest last)
                });
                
                this.cdr.detectChanges();
                this.scrollToBottom();
            },
            error: (error: HttpErrorResponse) => {
                console.error('Failed to load discussions:', error);
                this.discussions[teamId] = [];
                this.cdr.detectChanges();
            }
        });
    }

    sendMessage(): void {
        console.log('Attempting to send message:', {
            teamId: this.selectedTeam?.id,
        });

        // Allow sending if message contains text or at least one emoji
        const emojiRegex = /^(\s*([\p{Emoji}\u200d\ufe0f])+\s*)+$/u;
        const isEmojiOnly = emojiRegex.test(this.newMessage || '');
        if (!this.selectedTeam?.id || (!this.newMessage.trim() && !isEmojiOnly) || !this.teamMemberId) {
            console.warn('Send message blocked due to invalid state');
            return;
        }

        // Check if this is an AI command (starts with @AI)
        if (this.newMessage.trim().startsWith('@AI')) {
            this.handleAICommand(this.newMessage.trim().substring(3).trim());
            return;
        }

        // Filter bad words before sending
        const filteredMessage = this.filterBadWords(this.newMessage.trim());
        const token = this.authService.getToken();

        this.sendingMessage = true;
        const teamMemberId = this.teamMemberId || 0;

        const payload = { message: this.filterBadWords(this.newMessage) };
        console.log('Sending message payload:', payload);

        this.teamDiscussionService.sendMessage(this.selectedTeam!.id!, teamMemberId, this.filterBadWords(this.newMessage), TeamDiscussionMessageType.TEXT).pipe(
            takeUntil(this.destroy$),
            finalize(() => {
                this.sendingMessage = false;
                this.cdr.detectChanges();
                console.log('sendMessage finalize');
            })
        ).subscribe({
            next: (response) => {
                console.log('Message sent successfully:', response);
                const discussion: TeamDiscussion = {
                    id: Date.now(),
                    message: this.filterBadWords(this.newMessage), // Already filtered
                    team: { id: this.selectedTeam!.id! } as Team,
                    teamMember: {
                        id: this.teamMemberId!,
                        user: {
                            id: this.userId!,
                            name: this.currentUserLogin,
                            lastname: '', // Provide default or fetch actual value
                            email: '' // Provide default or fetch actual value
                        },
                        team: { id: this.selectedTeam!.id! } as Team,
                        role: 'MEMBER'
                    } as TeamMember,
                    messageType: TeamDiscussionMessageType.TEXT,
                    isRead: false,
                    createdAt: this.currentDateTime
                };
                const teamId = this.selectedTeam?.id;
                if (typeof teamId === 'number') {
                    if (!this.discussions[teamId]) this.discussions[teamId] = [];
                    this.discussions[teamId].push(discussion);
                }
                this.newMessage = '';
                this.cdr.detectChanges();
                this.scrollToBottom();
            },
            error: (error: HttpErrorResponse) => {
                console.error('Failed to send message:', error);
            }
        });
    }

    // Helper method to get formatted message time
    getMessageTime(timestamp?: string): string {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Helper method to get formatted message date
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
            return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        }
    }
    
    // Helper method to determine if we should show a date divider
    shouldShowDateDivider(prevTimestamp?: string, currentTimestamp?: string): boolean {
        if (!prevTimestamp || !currentTimestamp) return true;
        
        const prevDate = new Date(prevTimestamp);
        const currentDate = new Date(currentTimestamp);
        
        return prevDate.toDateString() !== currentDate.toDateString();
    }

    // Check if a message is from the current user
    isCurrentUserMessage(teamMemberId?: number): boolean {
        return teamMemberId === this.teamMemberId;
    }
    
    // Get team initials for avatar
    getTeamInitials(teamName?: string): string {
        if (!teamName) return '?';
        return teamName.split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }
    // Check if a message is consecutive (from the same sender within a short time)
    isConsecutiveMessage(prevMessage: TeamDiscussion, currentMessage: TeamDiscussion): boolean {
        if (!prevMessage || !currentMessage) return false;
        
        // Check if message has isLoading flag (temporary AI message)
        if ((prevMessage as any).isLoading || (currentMessage as any).isLoading) return false;
        
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
    shouldShowTime(message: TeamDiscussion, messages: TeamDiscussion[], index: number): boolean {
        // Always show time for the last message in a conversation
        const isLastMessage = index === messages.length - 1;
        
        // Show time for messages that are more than 5 minutes apart
        if (index < messages.length - 1) {
            const nextMessage = messages[index + 1];
            const currentTime = new Date(message.createdAt || '').getTime();
            const nextTime = new Date(nextMessage.createdAt || '').getTime();
            const timeGap = nextTime - currentTime;
            
            return timeGap > 5 * 60 * 1000; // 5 minutes in milliseconds
        }
        
        return isLastMessage;
    }

    onEnterPress(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            console.log('Enter pressed, sending message');
            this.sendMessage();
        }
    }

    getJoinButtonTooltip(team: Team): string {
        if (team.isFull) return 'Team is full';
        return 'Join team';
    }

    disconnectWebSocket(): void {
        if (this.wsSubject) {
            this.wsSubject.complete();
            this.wsSubject = null;
        }

        if (this.wsSubscription) {
            this.wsSubscription.unsubscribe();
            this.wsSubscription = null;
        }
    }

    leaveCurrentTeam(): void {
        if (!this.selectedTeam?.id || !this.userId) {
            this.showError('Unable to leave team: Missing team or user information');
            return;
        }

        this.loading = true;
        this.teamService.leaveTeam(this.selectedTeam.id)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: () => {
                    // Disconnect from WebSocket
                    this.disconnectWebSocket();

                    // Show success message
                    this.showSuccess(`Successfully left team "${this.selectedTeam?.teamName}"`);

                    // Reset component state
                    this.resetDialogData();
                    this.closeAllDialogs();

                    // Return to the participate dialog
                    this.setParticipateDialog(true);
                    // Close the dialog with 'left' result
                    this.ref.close('left');
                },
                error: (error) => {
                    console.error('Error leaving team:', error);
                    this.showError(`Failed to leave team: ${error}`);
                }
            });
    }

    // File upload logic
    public onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            if (!this.selectedTeam || !this.selectedTeam.id || !this.teamMemberId) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('teamMemberId', this.teamMemberId.toString());
            formData.append('teamId', this.selectedTeam.id.toString());

            this.sendingMessage = true;
            this.uploadFile(formData).subscribe({
                next: (discussion: any) => {
                    const teamId = this.selectedTeam?.id;
                    if (typeof teamId === 'number') {
                        if (!this.discussions[teamId]) this.discussions[teamId] = [];
                        this.discussions[teamId].push(discussion);
                        this.cdr.detectChanges();
                        this.scrollToBottom();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'File Sent',
                            detail: `Sent file: ${file.name}`
                        });
                    }
                },
                error: (error: any) => {
                    this.showError('Failed to send file: ' + (error?.error?.error || error.message));
                },
                complete: () => {
                    this.sendingMessage = false;
                }
            });
    }

    }

    // --- PINNED MESSAGES FUNCTIONALITY ---
    // (Pinning logic handled by methods below)

    // Toggle chat sidebar view
    public toggleChatView(): void {
        this.showChatView = !this.showChatView;
        // If opening the chat, make sure we have the latest messages
        if (this.showChatView && this.selectedTeam) {
            this.loadTeamDiscussions(this.selectedTeam.id);
        }
        // Scroll to bottom of chat when opening
        if (this.showChatView) {
            setTimeout(() => {
                this.scrollToBottom();
            }, 100);
        }
    }

    // Toggle participation view
    public toggleParticipationView(): void {
        // Close chat view if open
        if (this.showChatView) {
            this.showChatView = false;
        }
        this.setParticipateDialog(true);
    }

    // Leave the current team
    public leaveTeam(): void {
        if (!this.selectedTeam || !this.teamMemberId) {
            return;
        }
        this.loading = true;
        this.teamService.leaveTeam(this.selectedTeam.id)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: () => {
                    // Disconnect from WebSocket
                    this.disconnectWebSocket();

                    // Show success message
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `You have left the team ${this.selectedTeam?.teamName}`
                    });
                    // Close the dialog with 'left' result
                    this.ref.close('left');
                },
                error: (error) => {
                    console.error('Error leaving team:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to leave the team. Please try again.'
                    });
                }
            });
    }

    // Open full chat view in a dedicated page
    public openFullChatView(): void {
        if (!this.selectedTeam) return;
        
        // Store the current team in localStorage for persistence
        localStorage.setItem('currentChatTeam', JSON.stringify(this.selectedTeam));
        
        // Get the team ID before closing the dialog
        const teamId = this.selectedTeam.id;
        
        // Close the current dialog
        this.hideConversationDialog();
        
        // Navigate to the team hub in the current window instead of a new tab
        window.location.href = `/team-chat-hub/${teamId}`;
    }

    public triggerFileUpload(): void {
        const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    }

    /**
     * Clean up WebSocket connections and polling
     */
    public cleanupWebSocket(): void {
        console.log('Cleaning up WebSocket');
        if (this.wsSubscription) {
            this.wsSubscription.unsubscribe();
            this.wsSubscription = null;
        }
        if (this.wsSubject) {
            try {
                this.wsSubject.complete();
            } catch (error) {
                console.error('Error closing WebSocket:', error);
            }
            this.wsSubject = null;
        }
        // Also clear any polling interval
        this.clearPollingInterval();
    }

    /**
     * Clear polling interval
     */
    private clearPollingInterval(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    /**
     * Initialize WebSocket connection for real-time chat
     */
    public initializeWebSocket(teamId: number): void {
        console.log('Initializing WebSocket for team:', teamId);
        this.cleanupWebSocket();

        try {
            // Use a more reliable WebSocket connection with error handling
            this.wsSubject = webSocket({
                url: `ws://localhost:9100/ws`,
                openObserver: {
                    next: () => {
                        this.wsReconnectAttempts = 0;
                        console.log('WebSocket connected');
                        this.subscribeToTeam(teamId);
                        this.showSuccess('Real-time chat connected');
                    }
                },
                closeObserver: {
                    next: () => {
                        console.log('WebSocket connection closed');
                        // Only attempt to reconnect if not manually closed
                        if (this.selectedTeam) {
                            this.attemptReconnect(teamId);
                        }
                    }
                },
                // Add a serializer to handle message formatting
                serializer: (value) => JSON.stringify(value)
            });

            this.wsSubscription = this.wsSubject.pipe(
                // Add retry logic
                retry(3),
                // Add timeout to prevent hanging connections
                timeout(30000),
                takeUntil(this.destroy$)
            ).subscribe({
                next: (message) => this.handleWebSocketMessage(message, teamId),
                error: (error) => this.handleWebSocketError(error, teamId)
            });
        } catch (error) {
            console.error('Error initializing WebSocket:', error);
            // Fallback to polling if WebSocket fails completely
            this.setupPollingFallback(teamId);
        }
    }

    /**
     * Handle WebSocket messages
     */
    private handleWebSocketMessage(message: any, teamId: number): void {
        console.log('WebSocket message received:', message);
        const discussion: TeamDiscussion = {
            id: message.id || Date.now(),
            message: this.filterBadWords(message.message || 'Message missing'),
            team: { id: teamId } as Team,
            teamMember: {
                id: message.teamMemberId,
                user: {
                    id: message.userId,
                    name: message.senderName || 'Unknown',
                    lastname: '', // Provide default or fetch actual value
                    email: '' // Provide default or fetch actual value
                },
                team: { id: teamId } as Team,
                role: 'MEMBER'
            } as TeamMember,
            messageType: message.messageType || TeamDiscussionMessageType.TEXT,
            isRead: message.isRead ?? false,
            createdAt: message.createdAt || this.currentDateTime
        };

        const selectedTeamId = this.selectedTeam?.id;
        if (typeof selectedTeamId === 'number') {
            if (!this.discussions[selectedTeamId]) this.discussions[selectedTeamId] = [];
            this.discussions[selectedTeamId].push(discussion);
        }
        this.cdr.detectChanges();
        this.scrollToBottom();
    }

    /**
     * Handle WebSocket errors
     */
    private handleWebSocketError(error: any, teamId: number): void {
        console.error('WebSocket error:', error);
        // Silently fall back to polling without showing error notifications
        this.attemptReconnect(teamId);
    }

    /**
     * Attempt to reconnect WebSocket
     */
    private attemptReconnect(teamId: number): void {
        if (this.wsReconnectAttempts < this.maxReconnectAttempts) {
            this.wsReconnectAttempts++;
            console.log('Reconnecting WebSocket, attempt:', this.wsReconnectAttempts);
            const delay = Math.min(1000 * Math.pow(2, this.wsReconnectAttempts), 30000);
            setTimeout(() => this.initializeWebSocket(teamId), delay);
        } else {
            console.warn('Failed to reconnect WebSocket after max attempts');
            // Silently fall back to polling without showing error notification
            this.setupPollingFallback(teamId);
        }
    }

    /**
     * Subscribe to team topic
     */
    private subscribeToTeam(teamId: number): void {
        if (this.wsSubject) {
            console.log('Subscribing to team topic:', `/topic/team/${teamId}`);
            this.wsSubject.next({
                type: 'subscribe',
                destination: `/topic/team/${teamId}`
            });
        }
    }

    /**
     * Set up polling as a fallback when WebSocket fails
     * Note: All refresh functionality has been completely disabled as requested
     */
    private setupPollingFallback(teamId: number): void {
        console.log('All refresh functionality disabled for team:', teamId);
        this.clearPollingInterval();
        
        // No refresh at all, not even a one-time refresh
        // Messages will only be loaded once when the chat is initially opened
    }


    // --- PINNED MESSAGES FUNCTIONALITY ---
    /**
     * Helper to get messages for the selected team
     */
    public getMessages(): TeamDiscussion[] {
        if (this.selectedTeam && this.discussions[this.selectedTeam.id]) {
            return this.discussions[this.selectedTeam.id];
        }
        return [];
    }

    public isPinned(message: TeamDiscussion): boolean {
        return this.pinnedMessages.some((m: TeamDiscussion) => m.id === message.id);
    }

    public updateMessagePinStatus(messageId: number, isPinned: boolean): void {
        const messages = this.getMessages();
        if (isPinned) {
            const msg = messages.find((m: TeamDiscussion) => m.id === messageId);
            if (msg && !this.pinnedMessages.some((m: TeamDiscussion) => m.id === messageId)) {
                this.pinnedMessages.push(msg);
            }
        } else {
            this.pinnedMessages = this.pinnedMessages.filter((m: TeamDiscussion) => m.id !== messageId);
        }
    }

    public uploadFile(formData: FormData): Observable<any> {
        // Simulate file upload logic (replace with real API integration)
        console.log('Uploading file...', formData);
        // Return a dummy observable for now
        return of({
            id: Date.now(),
            message: formData.get('file')?.toString() || '',
            sender: this.currentUserLogin,
            createdAt: new Date(),
            pinned: false
        });
    }

    // --- GEMINI AI FUNCTIONALITY ---
    /**
     * Toggle Gemini Chat panel visibility
     */
    public toggleGeminiAI(): void {
        this.geminiActive = !this.geminiActive;
        if (!this.geminiActive) {
            // Keep chat history when closing
            this.geminiPrompt = '';
        } else {
            // Scroll to bottom when opening
            setTimeout(() => this.scrollGeminiChatToBottom(), 100);
        }
        this.cdr.detectChanges();
    }
    
    /**
     * Clear Gemini chat history
     */
    public clearGeminiChat(): void {
        this.geminiChatHistory = [];
        this.geminiResponse = '';
        this.geminiPrompt = '';
        
        // Also clear the conversation history in the service
        if (this.selectedTeam) {
            this.geminiAIService.clearConversationHistory(this.selectedTeam.teamName);
        } else {
            this.geminiAIService.clearConversationHistory();
        }
        
        this.cdr.detectChanges();
    }
    
    /**
     * Use a prompt suggestion
     */
    public usePromptSuggestion(suggestion: string): void {
        this.geminiPrompt = suggestion;
        this.sendGeminiPrompt();
    }
    
    /**
     * Scroll Gemini chat to bottom
     */
    private scrollGeminiChatToBottom(): void {
        if (this.geminiChatContainer) {
            const element = this.geminiChatContainer.nativeElement;
            element.scrollTop = element.scrollHeight;
        }
    }

    /**
     * Handle keyboard events in the Gemini chat input
     * @param event The keyboard event
     */
    onGeminiKeydown(event: KeyboardEvent): void {
        // Only handle Enter key
        if (event.key !== 'Enter') {
            return;
        }
        
        // If Ctrl+Enter, allow new line
        if (event.ctrlKey) {
            return;
        }
        
        // Otherwise, prevent default and send message
        event.preventDefault();
        this.sendGeminiPrompt();
    }
    
    /**
     * Send a prompt to the Gemini Chat
     */
    public sendGeminiPrompt(): void {
        if (!this.geminiPrompt.trim() || this.geminiLoading) {
            return;
        }

        // Add user message to chat history
        const userMessage = {
            role: 'user',
            content: this.geminiPrompt
        };
        this.geminiChatHistory.push(userMessage);
        
        // Clear the prompt and scroll to bottom
        const promptText = this.geminiPrompt;
        this.geminiPrompt = '';
        this.geminiLoading = true;
        this.cdr.detectChanges();
        this.scrollGeminiChatToBottom();
        
        // Get team context for better Gemini responses
        const teamContext = this.selectedTeam ? 
            `${this.selectedTeam.teamName}` : 
            undefined;

        // Get the current session ID for this team
        const sessionId = this.geminiAIService.getSessionId(teamContext);
        
        this.geminiAIService.getGeminiResponse({
            prompt: promptText,
            teamContext: teamContext,
            teamId: this.selectedTeam?.id,
            teamMemberId: this.teamMemberId || 0,
            sessionId: sessionId,
            maxTokens: 800
        }).pipe(
            takeUntil(this.destroy$),
            finalize(() => {
                this.geminiLoading = false;
                this.cdr.detectChanges();
                this.scrollGeminiChatToBottom();
            })
        ).subscribe({
            next: (response: GeminiResponse) => {
                // Add Gemini response to chat history
                const geminiMessage = {
                    role: 'gemini',
                    content: response.text
                };
                this.geminiChatHistory.push(geminiMessage);
                this.geminiActive = true;
                
                // Also update the response property for backward compatibility
                this.geminiResponse = response.text;
                
                // Scroll to bottom after rendering
                setTimeout(() => this.scrollGeminiChatToBottom(), 100);
            },
            error: (error: any) => {
                console.error('Gemini AI error:', error);
                
                // Get a more detailed error message
                let errorContent = 'Sorry, I encountered an error. Please try again.';
                if (error && error.message) {
                    console.error('Error message:', error.message);
                    // Check if it's an API key error
                    if (error.message.includes('API key')) {
                        errorContent = 'There seems to be an issue with the API key. Please contact the administrator.';
                    } else if (error.message.includes('quota')) {
                        errorContent = 'The API quota has been exceeded. Please try again later.';
                    }
                }
                
                // Add error message to chat
                const errorMessage = {
                    role: 'gemini',
                    content: errorContent
                };
                this.geminiChatHistory.push(errorMessage);
                
                this.showError('Failed to get Gemini response: ' + errorContent);
                setTimeout(() => this.scrollGeminiChatToBottom(), 100);
            }
        });
    }

    /**
     * Handle Gemini commands in the chat (messages that start with @AI)
     * This is the implementation used by the sendMessage method
     * @param prompt The prompt text from the user (without the @AI prefix)
     */
    private handleAICommand(prompt: string): void {
        if (!this.selectedTeam || !prompt.trim()) {
            console.warn('Cannot process AI command: No team selected or empty prompt');
            return;
        }

        console.log('Processing AI command with prompt:', prompt);
        
        // Add user message to chat
        const userMessage: TeamDiscussion = {
            id: Date.now(),
            message: `@AI ${prompt}`,
            team: { id: this.selectedTeam!.id! } as Team,
            teamMember: {
                id: this.teamMemberId!,
                user: {
                    id: this.userId!,
                    name: this.currentUserLogin,
                    lastname: '',
                    email: ''
                },
                team: { id: this.selectedTeam!.id! } as Team,
                role: 'MEMBER'
            } as TeamMember,
            messageType: TeamDiscussionMessageType.TEXT,
            isRead: false,
            createdAt: this.currentDateTime
        };

        const teamId = this.selectedTeam?.id;
        if (typeof teamId === 'number') {
            if (!this.discussions[teamId]) this.discussions[teamId] = [];
            this.discussions[teamId].push(userMessage);
            
            // Save the user's prompt to the database
            this.teamDiscussionService.sendMessage(
                teamId,
                this.teamMemberId || 0,
                `@AI ${prompt}`,
                TeamDiscussionMessageType.TEXT
            ).subscribe({
                next: (response) => {
                    console.log('User AI prompt saved to database:', response);
                },
                error: (error) => {
                    console.error('Failed to save user AI prompt:', error);
                }
            });
        }

        this.newMessage = '';
        this.cdr.detectChanges();
        this.scrollToBottom();

        // Show a loading indicator in the chat
        const loadingMessage: GeminiTeamDiscussion = {
            id: Date.now() + 1,
            message: '<i>Gemini is generating response...</i>',
            team: { id: this.selectedTeam!.id! } as Team,
            teamMember: {
                id: 0, // Special ID for AI
                user: {
                    id: 0,
                    name: 'Gemini Assistant',
                    lastname: '',
                    email: ''
                },
                team: { id: this.selectedTeam!.id! } as Team,
                role: 'GEMINI'
            } as TeamMember,
            messageType: TeamDiscussionMessageType.TEXT,
            isRead: false,
            createdAt: this.currentDateTime,
            isAI: true,
            isLoading: true
        };

        if (typeof teamId === 'number') {
            this.discussions[teamId].push(loadingMessage);
            this.cdr.detectChanges();
            this.scrollToBottom();
        }

        // Filter bad words before sending to Gemini
        const filteredPrompt = this.filterBadWords(prompt);

        // Get the current session ID for this team
        const sessionId = this.geminiAIService.getSessionId(this.selectedTeam?.teamName);
        
        // Get response from Gemini with better context and session tracking
        this.geminiAIService.getGeminiResponse({
            prompt: filteredPrompt,
            teamContext: this.selectedTeam?.teamName || 'Unknown',
            teamId: this.selectedTeam?.id,
            teamMemberId: this.teamMemberId || 0,
            sessionId: sessionId,
            maxTokens: 800
        }).pipe(
            takeUntil(this.destroy$),
            finalize(() => {
                this.cdr.detectChanges();
                this.scrollToBottom();
            })
        ).subscribe({
            next: (response: GeminiResponse) => {
                console.log('Received Gemini response:', response);
                
                // Remove the loading message
                if (typeof teamId === 'number') {
                    this.discussions[teamId] = this.discussions[teamId].filter(msg => msg.id !== loadingMessage.id);
                }

                // Create a Gemini response message using the AI team member
                const aiMessage: GeminiTeamDiscussion = {
                    id: Date.now() + 2,
                    message: response.text,
                    team: { id: this.selectedTeam!.id! } as Team,
                    teamMember: this.aiTeamMember || {
                        id: -999, // Fallback ID for AI
                        user: {
                            id: -999,
                            name: 'Gemini Assistant',
                            lastname: '',
                            email: 'ai-assistant@system.local'
                        },
                        team: { id: this.selectedTeam!.id! } as Team,
                        role: 'GEMINI'
                    } as TeamMember,
                    messageType: TeamDiscussionMessageType.TEXT,
                    isRead: false,
                    createdAt: this.currentDateTime,
                    isAI: true,
                    isLoading: false
                };

                if (typeof teamId === 'number') {
                    if (!this.discussions[teamId]) this.discussions[teamId] = [];
                    this.discussions[teamId].push(aiMessage);
                    
                    // Save the AI response to the server
                    this.saveAIMessageToServer(teamId, response.text);
                }
                this.cdr.detectChanges();
                this.scrollToBottom();
            },
            error: (error: any) => {
                console.error('Gemini AI error:', error);
                
                // Remove the loading message
                if (typeof teamId === 'number') {
                    this.discussions[teamId] = this.discussions[teamId].filter(msg => msg.id !== loadingMessage.id);
                }
                
                // Get a more detailed error message
                let errorContent = 'Sorry, I encountered an error. Please try again.';
                if (error && error.message) {
                    console.error('Error message:', error.message);
                    // Check if it's an API key error
                    if (error.message.includes('API key')) {
                        errorContent = 'There seems to be an issue with the API key. Please contact the administrator.';
                    } else if (error.message.includes('quota')) {
                        errorContent = 'The API quota has been exceeded. Please try again later.';
                    }
                }
                
                // Add error message to chat
                const errorMessage: GeminiTeamDiscussion = {
                    id: Date.now() + 2,
                    message: errorContent,
                    team: { id: this.selectedTeam!.id! } as Team,
                    teamMember: {
                        id: 0, // Special ID for AI
                        user: {
                            id: 0,
                            name: 'Gemini Assistant',
                            lastname: '',
                            email: ''
                        },
                        team: { id: this.selectedTeam!.id! } as Team,
                        role: 'GEMINI'
                    } as TeamMember,
                    messageType: TeamDiscussionMessageType.TEXT,
                    isRead: false,
                    createdAt: this.currentDateTime,
                    isAI: true,
                    isLoading: false
                };
                
                if (typeof teamId === 'number') {
                    if (!this.discussions[teamId]) this.discussions[teamId] = [];
                    this.discussions[teamId].push(errorMessage);
                    
                    // Save the error message to the server
                    this.saveAIMessageToServer(teamId, errorContent);
                }
                
                this.showError('Failed to get Gemini response: ' + errorContent);
                this.cdr.detectChanges();
                this.scrollToBottom();
            }
        });
    }

    /**
     * Add a Gemini AI response to the team chat
     * @param responseText The text response from Gemini AI
     */
    private addGeminiResponseToChat(responseText: string): void {
        if (!responseText || !this.selectedTeam) {
            console.warn('Cannot add Gemini response: No response text or team selected');
            return;
        }

        // Create a Gemini response message
        const aiMessage: GeminiTeamDiscussion = {
            id: Date.now(),
            message: responseText,
            team: { id: this.selectedTeam!.id! } as Team,
            teamMember: {
                id: 0, // Special ID for AI
                user: {
                    id: 0,
                    name: 'Gemini Assistant',
                    lastname: '',
                    email: ''
                },
                team: { id: this.selectedTeam!.id! } as Team,
                role: 'GEMINI'
            } as TeamMember,
            messageType: TeamDiscussionMessageType.TEXT,
            isRead: false,
            createdAt: this.currentDateTime,
            isAI: true,
            isLoading: false
        };

        // Add the message to the discussions
        const teamId = this.selectedTeam?.id;
        if (typeof teamId === 'number') {
            if (!this.discussions[teamId]) this.discussions[teamId] = [];
            this.discussions[teamId].push(aiMessage);
            this.cdr.detectChanges();
            this.scrollToBottom();
        }
    }

    /**
     * Send the Gemini response to the team chat
     */
    private sendGeminiResponseToChat(): void {
        if (!this.geminiResponse || !this.selectedTeam) {
            return;
        }

        // Add the Gemini response directly to the chat
        this.addGeminiResponseToChat(this.geminiResponse);
        
        // For debugging: log the message that would be sent
        const aiMessage = `[Gemini Assistant] ${this.geminiResponse}`; 
        
        // Clear the response
        this.geminiResponse = '';

        // Send the message
        this.teamDiscussionService.sendMessage(this.selectedTeam.id, this.teamMemberId || 0, aiMessage, TeamDiscussionMessageType.TEXT).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (response: any) => {
                console.log('Gemini response sent to chat:', response);
            },
            error: (error: any) => {
                console.error('Failed to send Gemini response to chat:', error);
            }
        });
    }

    /**
     * Generate a summary of recent team discussions
     */
    public generateDiscussionSummary(): void {
        if (!this.selectedTeam) {
            this.showError('No team selected');
            return;
        }

        this.geminiLoading = true;
        const discussions = this.getMessages();

        this.geminiAIService.getGeminiResponse({
            prompt: `Summarize the following team discussion:\n\n${discussions.map(msg => msg.message).join('\n')}`,
            maxTokens: 500
        }).pipe(
            takeUntil(this.destroy$),
            finalize(() => {
                this.geminiLoading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (response: GeminiResponse) => {
                this.geminiResponse = response.text;
                this.geminiActive = true;
            },
            error: (error: any) => {
                console.error('Gemini AI error:', error);
                this.showError('Failed to generate discussion summary. Please try again.');
            }
        });
    }

    /**
     * Analyze code snippet shared in the team chat
     */
    public analyzeCode(code: string, language: string = 'javascript'): void {
        if (!code.trim()) {
            return;
        }
        
        this.geminiLoading = true;
        
        // Call Gemini service to analyze code
        this.geminiAIService.getGeminiResponse({
            prompt: `Analyze the following ${language} code and provide feedback:\n\n\`\`\`${language}\n${code}\n\`\`\``,
            maxTokens: 500
        }).pipe(       
            takeUntil(this.destroy$),
            finalize(() => {
                this.geminiLoading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (response: GeminiResponse) => {
                this.geminiResponse = response.text;
                this.geminiActive = true;
            },
            error: (error: any) => {
                console.error('Gemini AI error:', error);
                this.showError('Failed to analyze code. Please try again.');
            }
        });
    }

    /**
     * Save an AI message to the server
     * @param teamId The team ID
     * @param message The message text
     */
    private saveAIMessageToServer(teamId: number, message: string): void {
        if (!teamId || !message) {
            console.warn('Cannot save AI message: Missing teamId or message');
            return;
        }

        // Use the AI team member if available, otherwise use a fallback ID
        const aiTeamMemberId = this.aiTeamMember?.id || -999;
        
        // Format the message in a way that's compatible with the backend
        // No need for special prefix since we're using the AI team member
        const formattedMessage = message;
        
        console.log('Attempting to save AI message to database:', {
            teamId,
            aiTeamMemberId,
            messageLength: formattedMessage.length
        });
        
        // First attempt to save the message using the AI team member
        const saveMessage = () => {
            this.teamDiscussionService.sendMessage(
                teamId, 
                aiTeamMemberId, 
                formattedMessage, 
                TeamDiscussionMessageType.TEXT
            ).pipe(
                takeUntil(this.destroy$)
            ).subscribe({
                next: (response: any) => {
                    console.log('AI message successfully saved to database:', response);
                    // Update the local discussions array with the server ID
                    if (response && response.id) {
                        // Find the temporary message and update its ID
                        const tempMessages = this.discussions[teamId].filter(msg => 
                            (msg as GeminiTeamDiscussion).isAI && 
                            (msg.teamMember?.id === aiTeamMemberId || msg.teamMember?.id === 0) && 
                            !(msg as GeminiTeamDiscussion).isLoading);
                        if (tempMessages.length > 0) {
                            const lastTempMessage = tempMessages[tempMessages.length - 1];
                            lastTempMessage.id = response.id;
                            // Also update the team member ID to match the server
                            if (lastTempMessage.teamMember) {
                                lastTempMessage.teamMember.id = aiTeamMemberId;
                            }
                            this.cdr.detectChanges();
                        }
                    }
                },
                error: (error: any) => {
                    console.error('Failed to save AI message to database:', error);
                    // Retry once after a delay
                    setTimeout(() => {
                        console.log('Retrying to save AI message to database...');
                        this.retryAIMessageSave(teamId, formattedMessage);
                    }, 1000);
                }
            });
        };
        
        // Execute the save operation
        saveMessage();
    }
    
    /**
     * Retry saving an AI message to the database
     */
    private retryAIMessageSave(teamId: number, message: string): void {
        // Use the AI team member if available, otherwise use a fallback ID
        const aiTeamMemberId = this.aiTeamMember?.id || -999;
        
        this.teamDiscussionService.sendMessage(
            teamId, 
            aiTeamMemberId, 
            message, 
            TeamDiscussionMessageType.TEXT
        ).subscribe({
            next: (response: any) => {
                console.log('Retry successful: AI message saved to database:', response);
            },
            error: (retryError: any) => {
                console.error('Retry failed: AI message could not be saved:', retryError);
                // Make one final attempt with a different approach
                this.finalAttemptSaveAIMessage(teamId, message);
            }
        });
    }
    
    /**
     * Final attempt to save an AI message using a different approach
     */
    private finalAttemptSaveAIMessage(teamId: number, message: string): void {
        // First try with the current user's team member ID as a fallback
        const fallbackTeamMemberId = this.teamMemberId || 0;
        
        // Create a message format that clearly identifies this as an AI message
        const formattedMessage = `[AI Assistant] ${message}`;
        
        console.log('Making final attempt to save AI message using user ID:', {
            teamId,
            fallbackTeamMemberId,
            messageLength: formattedMessage.length
        });
        
        // Try sending the message as if it came from the current user
        this.teamDiscussionService.sendMessage(
            teamId, 
            fallbackTeamMemberId, 
            formattedMessage, 
            TeamDiscussionMessageType.TEXT
        ).subscribe({
            next: (response: any) => {
                console.log('Final attempt successful: AI message saved using fallback method:', response);
                
                // Update the UI to reflect that the message was saved
                const tempMessages = this.discussions[teamId].filter(msg => 
                    (msg as GeminiTeamDiscussion).isAI && 
                    !(msg as GeminiTeamDiscussion).isLoading);
                
                if (tempMessages.length > 0) {
                    const lastTempMessage = tempMessages[tempMessages.length - 1];
                    lastTempMessage.id = response.id || lastTempMessage.id;
                    this.cdr.detectChanges();
                }
            },
            error: (finalError: any) => {
                console.error('All attempts to save AI message failed:', finalError);
                // Don't show error to user, just keep the message in the UI
                // The message will still be visible in the current session
                console.log('Message will remain visible in the current session only');
            }
        });
    }

    /**
     * Generate ideas for the team project
     */
    public generateIdeas(topic: string): void {
        if (!topic.trim()) {
            return;
        }
        
        this.geminiLoading = true;
        
        // Call Gemini service to generate ideas
        this.geminiAIService.getGeminiResponse({
            prompt: `Generate innovative ideas for a hackathon project on the topic of: ${topic}`,
            maxTokens: 500
        }).pipe(
            takeUntil(this.destroy$),
            finalize(() => {
                this.geminiLoading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (response: GeminiResponse) => {
                this.geminiResponse = response.text;
                this.geminiActive = true;
            },
            error: (error: any) => {
                console.error('Gemini AI error:', error);
                this.showError('Failed to generate ideas. Please try again.');
            }
        });
    }

    /**
     * Extract file name from path
     */
    public extractFileName(path: string): string {
        if (!path) return '';
        // Use a regex that handles both forward and backslashes
        const parts = path.split(/[\\/]/);
        return parts[parts.length - 1] || path;
    }
}
