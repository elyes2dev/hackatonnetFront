import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TeamService } from 'src/app/demo/services/team.service';
import { TeamDiscussionService } from 'src/app/demo/services/team-discussion.service';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Subject, Subscription, finalize, takeUntil, switchMap } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { HackathonService } from '../../services/hackathon/hackathon.service';
import { StorageService } from '../../services/storage.service';
import { Hackathon } from '../../models/hackathon';
import { Team } from '../../models/team';
import { TeamDiscussion, MessageType as TeamDiscussionMessageType } from '../../models/team-discussion';
import { TeamMember } from '../../models/team-members';

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
    FILE = 'FILE',
    EMOJI = 'EMOJI'
}

@Component({
    selector: 'app-team-frontoffice',
    templateUrl: './team-frontoffice.component.html',
    styleUrls: ['./team-frontoffice.component.scss']
})
export class TeamFrontofficeComponent implements OnInit, OnDestroy {
    readonly currentDateTime: string = '2025-04-16 13:04:48';
    readonly currentUserLogin: string = 'ramroumaa';

    @ViewChild('chatContainer') public chatContainer!: ElementRef;
    @ViewChild('emojiPanel') public emojiPanel: any;

    public dialogState$ = new BehaviorSubject<DialogState>({
        participate: false,
        create: false,
        join: false,
        conversation: false,
        success: false
    });

    public destroy$ = new Subject<void>();

    get participateDialog(): boolean { return this.dialogState$.value.participate; }
    get createTeamDialog(): boolean { return this.dialogState$.value.create; }
    get joinTeamDialog(): boolean { return this.dialogState$.value.join; }
    get conversationDialog(): boolean { return this.dialogState$.value.conversation; }
    get isAnyDialogOpen(): boolean {
        return Object.values(this.dialogState$.value).some(value => value);
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

    public wsSubject: WebSocketSubject<any> | null = null;
    public wsSubscription: Subscription | null = null;
    public wsReconnectAttempts = 0;
    public readonly maxReconnectAttempts = 5;

    createdTeamCode: string = '';
    showSuccessDialog: boolean = false;
    
    // Chat sidebar state
    showChatView: boolean = false;

    // Emoji picker state
    showEmojiPicker = false;
    recentEmojis: string[] = ['👍', '😂', '😍', '😎', '🔥', '🥳', '🎉', '❤️', '😊', '😭'];
    allEmojis: string[] = [
        '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','🥰','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','😡','😠','🤬','😷','🤒','🤕','🤢','🤮','🤧','😇','🥳','🥺','🤠','🤡','🤥','🤫','🤭','🧐','🤓','😈','👿','👹','👺','💀','👻','👽','🤖','💩','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🙈','🙉','🙊','🐵','🐒','🦍','🦧','🐶','🐕','🦮','🐕‍🦺','🐩','🐺','🦊','🦝','🐱','🐈','🐈‍⬛','🦁','🐯','🐅','🐆','🐴','🐎','🦄','🦓','🦌','🐮','🐂','🐃','🐄','🐷','🐖','🐗','🐽','🐏','🐑','🐐','🐪','🐫','🦙','🦒','🐘','🦏','🦛','🐭','🐁','🐀','🐹','🐰','🐇','🐿️','🦔','🦇','🐻','🐨','🐼','🦥','🦦','🦨','🦘','🦡','🐾','🦃','🐔','🐓','🐣','🐤','🐥','🐦','🐧','🕊️','🦅','🦆','🦢','🦉','🦩','🦚','🦜','🐸','🐊','🐢','🦎','🐍','🐲','🐉','🦕','🦖','🐳','🐋','🐬','🦭','🐟','🐠','🐡','🦈','🐙','🦑','🦐','🦞','🦀','🐚','🐌','🦋','🐛','🐜','🐝','🪲','🐞','🦗','🕷️','🕸️','🦂','🦟','🪰','🪱','🦠','💐','🌸','💮','🏵️','🌹','🥀','🌺','🌻','🌼','🌷','🌱','🪴','🌲','🌳','🌴','🌵','🌾','🌿','☘️','🍀','🍁','🍂','🍃','🍄','🌰','🌍','🌎','🌏','🌐','🪐','💫','⭐','🌟','✨','⚡','☄️','💥','🔥','🌪️','🌈','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','💧','💦','☔','☂️','🌊','🌫️','🌙','🌚','🌝','🌛','🌜','🌞','🪐','⭐','🌟','💫','✨','🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘','🌙','🌚','🌛','🌜','☀️','🌝','🌞','🪐','💥','🌈','☁️','⛅','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','💧','💦','☔','☂️','🌊','🌫️'];
    @ViewChild('emojiSliderTrack', { static: false }) emojiSliderTrack!: ElementRef;

    // Bad words filter (simple)
    private badWords = [
        'badword1', 'badword2', 'shit', 'fuck', 'bitch', 'asshole', 'idiot', 'damn', 'crap', 'dick', 'bastard', 'fag', 'slut', 'whore', 'douche', 'cunt', 'piss', 'prick', 'wank', 'twat', 'bollocks', 'bugger', 'arse', 'bloody', 'sod', 'git', 'wanker', 'jerk', 'moron', 'jackass', 'retard', 'suck', 'screwed', 'darn', 'hell', 'freak', 'loser', 'douchebag', 'motherfucker', 'nigger', 'nigga', 'retarded', 'gay', 'homo', 'queer', 'dyke', 'tranny', 'spaz', 'spastic', 'mong', 'gook', 'chink', 'kike', 'spic', 'wetback', 'beaner', 'tard', 'coon', 'raghead', 'camel jockey', 'sand nigger', 'zipperhead', 'gyp', 'gypsy', 'paki', 'paddy', 'mick', 'kraut', 'nip', 'yid', 'yiddo', 'wop', 'dago', 'greaseball', 'goombah', 'guido', 'mulatto', 'octaroon', 'quadroon', 'redskin', 'squaw', 'injun', 'sambo', 'pickaninny', 'jigaboo', 'porch monkey', 'tar baby', 'mammy', 'buck', 'coonass', 'cracker', 'hillbilly', 'hick', 'peckerwood', 'white trash', 'yokel', 'yuppie', 'zip coon', 'zulu'
    ];

    private filterBadWords(text: string): string {
        if (!text) return '';
        let filtered = text;
        for (const word of this.badWords) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            filtered = filtered.replace(regex, '*'.repeat(word.length));
        }
        return filtered;
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
        private storageService: StorageService
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
        console.log('Destroying TeamFrontofficeComponent');
        this.destroy$.next();
        this.destroy$.complete();
        this.cleanupWebSocket();
        this.closeAllDialogs();
        this.ref.close();
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
                this.hideConversationDialog();
            },
            complete: () => {
                this.loadingTeamMember = false;
                this.cdr.detectChanges();
                console.log('getTeamMemberId complete');
            }
        });
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
                this.discussions[teamId] = discussions;
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
            teamMemberId: this.teamMemberId,
            message: this.newMessage,
            hasToken: !!this.authService.getToken()
        });

        if (!this.selectedTeam?.id || !this.newMessage.trim() || !this.teamMemberId) {
            console.warn('Send message blocked due to invalid state');
            return;
        }

        // Filter bad words before sending
        const filteredMessage = this.filterBadWords(this.newMessage.trim());
        const token = this.authService.getToken();
        if (!token) {
            console.warn('No auth token');
            return;
        }

        const payload = { message: filteredMessage };
        this.sendingMessage = true;
        console.log('Sending message payload:', payload);

        this.teamDiscussionService.sendMessage(
            this.selectedTeam.id,
            this.teamMemberId,
            filteredMessage,
            TeamDiscussionMessageType.TEXT
        ).pipe(
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
                    message: filteredMessage,
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

    public initializeWebSocket(teamId: number): void {
        console.log('Initializing WebSocket for team:', teamId);
        this.cleanupWebSocket();

        this.wsSubject = webSocket({
            url: `ws://localhost:9100/ws`,
            openObserver: {
                next: () => {
                    this.wsReconnectAttempts = 0;
                    console.log('WebSocket connected');
                    this.subscribeToTeam(teamId);
                    this.showSuccess('Real-time chat connected');
                }
            }
        });

        this.wsSubscription = this.wsSubject.pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (message) => this.handleWebSocketMessage(message, teamId),
            error: (error) => this.handleWebSocketError(error, teamId)
        });
    }

    public handleWebSocketMessage(message: any, teamId: number): void {
        console.log('WebSocket message received:', message);
        const discussion: TeamDiscussion = {
            id: message.id || Date.now(),
            message: message.message || 'Message missing',
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

    public handleWebSocketError(error: any, teamId: number): void {
        console.error('WebSocket error:', error);
        this.attemptReconnect(teamId);
    }

    public attemptReconnect(teamId: number): void {
        if (this.wsReconnectAttempts < this.maxReconnectAttempts) {
            this.wsReconnectAttempts++;
            console.log('Reconnecting WebSocket, attempt:', this.wsReconnectAttempts);
            const delay = Math.min(1000 * Math.pow(2, this.wsReconnectAttempts), 30000);
            setTimeout(() => this.initializeWebSocket(teamId), delay);
        } else {
            console.warn('Failed to reconnect WebSocket after max attempts');
        }
    }

    public subscribeToTeam(teamId: number): void {
        if (this.wsSubject) {
            console.log('Subscribing to team topic:', `/topic/team/${teamId}`);
            this.wsSubject.next({
                type: 'subscribe',
                destination: `/topic/team/${teamId}`
            });
        }
    }

    public cleanupWebSocket(): void {
        console.log('Cleaning up WebSocket');
        if (this.wsSubscription) {
            this.wsSubscription.unsubscribe();
            this.wsSubscription = null;
        }
        if (this.wsSubject) {
            this.wsSubject.complete();
            this.wsSubject = null;
        }
    }

    public scrollToBottom(): void {
        setTimeout(() => {
            if (this.chatContainer?.nativeElement) {
                const element = this.chatContainer.nativeElement;
                element.scrollTop = element.scrollHeight;
                console.log('Scrolled to bottom, scrollHeight:', element.scrollHeight);
            } else {
                console.warn('Chat container not found');
            }
        }, 100);
    }

    // Helper method to get formatted message time
    getMessageTime(timestamp?: string): string {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

    public showSuccess(message: string): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: message
        });
    }

    showError(message: string): void {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: message
        });
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
        this.teamService.leaveTeam(this.selectedTeam.id).pipe(
            takeUntil(this.destroy$),
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
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
            error: (error: HttpErrorResponse) => {
                console.error('Failed to leave team:', error);
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
            // Add uploadFile method to TeamDiscussionService or use a different approach
            // For now, we'll create a placeholder method that returns an observable
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

    // Utility to extract file name from URL
    public extractFileName(url?: string): string {
        if (!url) return '';
        try {
            return url.split('/').pop() || url;
        } catch {
            return url;
        }
    }

    addEmoji(event: any) {
        const emoji = event.emoji?.native || event.emoji || event;
        this.newMessage = (this.newMessage || '') + emoji;
        // Update recent emojis
        if (!this.recentEmojis.includes(emoji)) {
          this.recentEmojis.unshift(emoji);
          if (this.recentEmojis.length > 12) this.recentEmojis.pop();
          // Save to localStorage for persistence across sessions
          localStorage.setItem('recentEmojis', JSON.stringify(this.recentEmojis));
        }
        // Close the emoji panel
        if (this.emojiPanel) {
            this.emojiPanel.hide();
        }
    }

    // --- UI Actions for Chat Input ---
    toggleEmojiPicker(event: Event) {
        this.showEmojiPicker = true;
        if (this.emojiPanel) {
            this.emojiPanel.toggle(event);
        }
    }
    
    // Toggle chat sidebar view
    toggleChatView() {
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
    toggleParticipationView() {
        // Close chat view if open
        if (this.showChatView) {
            this.showChatView = false;
        }
        this.setParticipateDialog(true);
    }
    
    // Leave the current team
    leaveTeam() {
        if (!this.selectedTeam || !this.teamMemberId) {
            return;
        }
        
        this.loading = true;
        this.teamService.leaveTeam(this.selectedTeam.id)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `You have left the team ${this.selectedTeam?.teamName}`
                    });
                    
                    // Close the dialog with 'left' result to indicate the user left the team
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
    openFullChatView() {
        if (!this.selectedTeam) return;
        
        // Store the current team in localStorage for persistence
        localStorage.setItem('currentChatTeam', JSON.stringify(this.selectedTeam));
        
        // Navigate to the full chat view page
        // We'll use window.open to open in a new tab
        window.open(`/team-chat-hub/${this.selectedTeam.id}`, '_blank');
    }

    triggerFileUpload() {
        const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    }

    // --- PINNED MESSAGES FUNCTIONALITY ---
    pinnedMessages: TeamDiscussion[] = [];

    pinMessage(message: TeamDiscussion): void {
        // Store the pinned state in the pinnedMessages array instead of on the message object
        if (!this.isPinned(message)) {
            this.pinnedMessages.push(message);
            // Add updateMessage method to TeamDiscussionService or use a different approach
            // For now, we'll use a placeholder method
            this.updateMessagePinStatus(message.team?.id!, message.id!, true).subscribe();
        }
    }

    unpinMessage(message: TeamDiscussion): void {
        this.pinnedMessages = this.pinnedMessages.filter(m => m.id !== message.id);
        // Add updateMessage method to TeamDiscussionService or use a different approach
        // For now, we'll use a placeholder method
        this.updateMessagePinStatus(message.team?.id!, message.id!, false).subscribe();
    }
    
    // Helper method to check if a message is pinned
    isPinned(message: TeamDiscussion): boolean {
        return this.pinnedMessages.some(m => m.id === message.id);
    }
    
    // Placeholder method for updating message pin status
    private updateMessagePinStatus(teamId: number, messageId: number, isPinned: boolean) {
        console.log(`Updating message ${messageId} pin status to ${isPinned}`);
        // This would be implemented in the service
        return new BehaviorSubject<any>({ success: true });
    }
    
    // Placeholder method for file upload
    private uploadFile(formData: FormData) {
        console.log('Uploading file:', formData.get('file'));
        // This would be implemented in the service
        return new BehaviorSubject<any>({
            id: Date.now(),
            message: 'File uploaded',
            messageType: TeamDiscussionMessageType.FILE,
            isRead: false,
            createdAt: this.currentDateTime
        });
    }

    // No longer needed with OverlayPanel approach
}
