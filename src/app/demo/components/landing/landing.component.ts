import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { User, Hackathon, Team, TeamDiscussion } from 'src/app/models';
import { UserControllerService } from 'src/app/services';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styles: [`
        #hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 700px;
            overflow: hidden;
            color: white;
        }

        .hero-content {
            z-index: 2;
            position: relative;
        }

        .hero-image {
            position: relative;
            z-index: 1;
            filter: drop-shadow(0 0 20px rgba(0,0,0,0.3));
            transition: all 0.3s ease;
        }

        .hero-image:hover {
            transform: translateY(-5px);
        }

        .hackathon-card {
            border: none;
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            background: var(--surface-card);
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        }

        .hackathon-card:hover {
            box-shadow: 0 14px 28px rgba(0,0,0,0.12), 0 10px 10px rgba(0,0,0,0.1);
            transform: translateY(-5px);
        }

        .hackathon-card h3 {
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }

        .hackathon-card .date-badge {
            background: var(--primary-color);
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 20px;
            font-size: 0.75rem;
            display: inline-block;
            margin-bottom: 0.5rem;
        }

        .chat-popup {
            min-width: 400px;
            max-width: 500px;
            height: 70vh;
            display: flex;
            flex-direction: column;
            background: var(--surface-ground);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .chat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: var(--primary-color);
            color: white;
        }
        
        .chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
            background: var(--surface-ground);
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .message {
            max-width: 80%;
            padding: 0.75rem 1rem;
            border-radius: 12px;
            position: relative;
            animation: fadeIn 0.3s ease-out;
        }
        
        .message.current-user {
            align-self: flex-end;
            background: var(--primary-color);
            color: white;
            border-bottom-right-radius: 0;
        }
        
        .message:not(.current-user) {
            align-self: flex-start;
            background: var(--surface-card);
            border: 1px solid var(--surface-border);
            border-bottom-left-radius: 0;
        }
        
        .message-header {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: var(--primary-color);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 0.75rem;
            font-weight: bold;
            flex-shrink: 0;
        }
        
        .current-user .user-avatar {
            background-color: white;
            color: var(--primary-color);
        }
        
        .username {
            font-weight: bold;
            margin-right: 0.5rem;
        }
        
        .timestamp {
            color: var(--text-color-secondary);
            font-size: 0.75rem;
        }
        
        .current-user .timestamp {
            color: rgba(255, 255, 255, 0.7);
        }
        
        .message-content {
            word-wrap: break-word;
            line-height: 1.4;
        }
        
        .chat-input {
            padding: 1rem;
            background: var(--surface-card);
            border-top: 1px solid var(--surface-border);
        }
        
        .input-wrapper {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        }

        .popup-content {
            background: var(--surface-card);
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            width: 90%;
            max-width: 500px;
            animation: popIn 0.3s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes popIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }

        @media screen and (max-width: 768px) {
            #hero {
                height: auto;
                padding: 2rem 0;
            }
            
            .hero-image {
                max-width: 80%;
                margin: 2rem auto;
            }
            
            .chat-popup {
                min-width: 90%;
                height: 80vh;
            }
        }

        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 0.5rem;
        }
        
        .status-online {
            background: var(--green-500);
        }
        
        .status-offline {
            background: var(--red-500);
        }

        .typing-indicator span {
            display: inline-block;
            animation: bounce 1.5s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
    `],
    animations: [
        trigger('messageAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(10px)' }),
                animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ]
})
export class LandingComponent implements OnInit, AfterViewChecked {
    userId: string | null = null;
    isAdmin: boolean = false;
    isLoading: boolean = false;
    isStudent: boolean = false;
    hackathons: Hackathon[] = [];
    teams: Team[] = [];
    discussions: { [teamId: number]: TeamDiscussion[] } = {};
    showTeamPopup: boolean = false;
    showCreateTeamPopup: boolean = false;
    showJoinTeamPopup: boolean = false;
    showConversationPopup: boolean = false;
    selectedHackathonId: number | null = null;
    selectedTeamId: number | null = null;
    newTeam: Team = { teamName: '', isPublic: false, teamCode: '' };
    joinTeamCode: string = '';
    newMessage: string = '';
    selectedHackathonName: string = '';
    selectedTeamName: string = '';
    onlineMembers: string[] = ['TeamLeader', 'john']; // Simulated online users

    @ViewChild('chatContainer') private chatContainer!: ElementRef;
    private shouldScroll = false;

    constructor(
        public layoutService: LayoutService,
        public router: Router,
        private userService: UserControllerService
    ) {
        const staticUserId = '1';
        localStorage.setItem('loggedid', staticUserId);
        localStorage.setItem('jwtToken', 'static-token-for-testing');
        this.userId = staticUserId;
    }

    ngOnInit(): void {
        this.getUserRole();
        this.loadHackathons();
        this.loadTeams();
        this.initializeSampleDiscussions();
    }

    ngAfterViewChecked() {
        if (this.shouldScroll) {
            this.scrollToBottom();
            this.shouldScroll = false;
        }
    }

    getUserRole() {
        const userId = localStorage.getItem('loggedid');
        if (userId) {
            this.userId = userId;
            this.userService.getUserById({ id: parseInt(userId) }).subscribe({
                next: (user: User) => {
                    if (user.roles && user.roles.length > 0) {
                        this.isAdmin = user.roles.some(role => role.name === 'admin');
                        this.isStudent = user.roles.some(role => role.name === 'student');
                    } else {
                        this.isStudent = true;
                    }
                },
                error: () => {
                    this.isStudent = true;
                }
            });
        }
    }

    loadHackathons() {
        this.isLoading = true;
        // Simulate API call delay
        setTimeout(() => {
            this.hackathons = [
                { 
                    id: 1, 
                    name: 'Global Hackathon 2023', 
                    maxTeamSize: 5, 
                    startDate: '2023-11-15', 
                    description: 'Annual global competition with $100k in prizes',
                    image: 'assets/demo/images/hackathons/global.jpg'
                },
                { 
                    id: 2, 
                    name: 'AI Innovation Challenge', 
                    maxTeamSize: 4, 
                    startDate: '2023-12-01', 
                    description: 'Build innovative AI solutions for real-world problems',
                    image: 'assets/demo/images/hackathons/ai.jpg'
                },
                { 
                    id: 3, 
                    name: 'Sustainability Hack', 
                    maxTeamSize: 6, 
                    startDate: '2024-01-10', 
                    description: 'Develop solutions for environmental sustainability',
                    image: 'assets/demo/images/hackathons/sustainability.jpg'
                },
                { 
                  id: 4, 
                  name: 'Test hack', 
                  maxTeamSize: 6, 
                  startDate: '2024-01-10', 
                  description: 'Develop solutions for environmental sustainability',
                  image: 'assets/demo/images/hackathons/sustainability.jpg'
              },
              { 
                id: 5, 
                name: 'Test hack2', 
                maxTeamSize: 6, 
                startDate: '2024-01-10', 
                description: 'Develop solutions for environmental sustainability',
                image: 'assets/demo/images/hackathons/sustainability.jpg'
            },
            { 
              id: 6, 
              name: 'Test hack3', 
              maxTeamSize: 6, 
              startDate: '2024-01-10', 
              description: 'Develop solutions for environmental sustainability',
              image: 'assets/demo/images/hackathons/sustainability.jpg'
          }
            ].map(h => ({
                ...h,
                joinedTeamId: this.teams.find(t => t.hackathon?.id === h.id)?.id || undefined
            }));

            this.isLoading = false;
        }, 1000);
    }

    loadTeams() {
        this.teams = [
            { 
                id: 1, 
                teamName: 'Code Wizards', 
                isPublic: true, 
                teamCode: 'WIZARD123', 
                hackathon: { id: 1, name: 'Global Hackathon 2023', maxTeamSize: 5 },
                
            },
            { 
                id: 2, 
                teamName: 'AI Pioneers', 
                isPublic: true, 
                teamCode: 'AIPIONEER', 
                hackathon: { id: 2, name: 'AI Innovation Challenge', maxTeamSize: 4 },
                
            }
        ];
    }

    initializeSampleDiscussions() {
        this.discussions = {
            1: [
                { 
                    id: 1, 
                    message: 'Welcome to Code Wizards! Let\'s brainstorm some project ideas.', 
                    teamMember: { user: { username: 'TeamLeader' } }, 
                    createdAt: new Date(Date.now() - 3600000) 
                },
                { 
                    id: 2, 
                    message: 'I was thinking we could build a platform for remote education.', 
                    teamMember: { user: { username: 'User2' } }, 
                    createdAt: new Date(Date.now() - 1800000) 
                },
                { 
                    id: 3, 
                    message: 'That sounds great! We could integrate AI for personalized learning.', 
                    teamMember: { user: { username: 'TeamLeader' } }, 
                    createdAt: new Date(Date.now() - 900000) 
                }
            ],
            2: [
                { 
                    id: 1, 
                    message: 'AI Pioneers team chat - let\'s discuss our approach to the challenge.', 
                    teamMember: { user: { username: 'TeamCaptain' } }, 
                    createdAt: new Date(Date.now() - 7200000) 
                },
                { 
                    id: 2, 
                    message: 'I suggest we focus on healthcare applications of AI.', 
                    teamMember: { user: { username: 'User4' } }, 
                    createdAt: new Date(Date.now() - 3600000) 
                }
            ]
        };
    }

    participate(hackathonId: number) {
        this.selectedHackathonId = hackathonId;
        const hackathon = this.hackathons.find(h => h.id === hackathonId);
        this.selectedHackathonName = hackathon?.name || '';
        this.showTeamPopup = true;
    }

    closeTeamPopup() {
        this.showTeamPopup = false;
        this.selectedHackathonId = null;
        this.selectedHackathonName = '';
    }

    openCreateTeamPopup() {
        this.showTeamPopup = false;
        this.showCreateTeamPopup = true;
        this.newTeam = { teamName: '', isPublic: false, teamCode: '' };
    }

    closeCreateTeamPopup() {
        this.showCreateTeamPopup = false;
    }

    createTeam() {
        if (!(this.newTeam.teamName ?? '').trim()) {
            alert('Please enter a team name');
            return;
        }

        const teamId = this.teams.length + 1;
        const teamCode = `TEAM${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const newTeam: Team = {
            id: teamId,
            teamName: this.newTeam.teamName,
            isPublic: this.newTeam.isPublic,
            teamCode: teamCode,
            hackathon: this.hackathons.find(h => h.id === this.selectedHackathonId),
        };
        
        this.teams.push(newTeam);
        this.hackathons = this.hackathons.map(h => 
            h.id === this.selectedHackathonId ? { ...h, joinedTeamId: teamId } : h
        );
        
        // Initialize discussion with welcome messages
        this.discussions[teamId] = [
            { 
                id: 1, 
                message: `Team ${this.newTeam.teamName} has been created!`, 
                teamMember: { user: { username: 'System' } }, 
                createdAt: new Date() 
            },
            { 
                id: 2, 
                message: `Invite others with team code: ${teamCode}`, 
                teamMember: { user: { username: 'System' } }, 
                createdAt: new Date() 
            },
            { 
                id: 3, 
                message: `Let's start discussing our project!`, 
                teamMember: { user: { username: 'System' } }, 
                createdAt: new Date() 
            }
        ];
        
        this.closeCreateTeamPopup();
        this.openConversation(teamId);
    }

    openJoinTeamPopup() {
        this.showTeamPopup = false;
        this.showJoinTeamPopup = true;
        this.joinTeamCode = '';
    }

    closeJoinTeamPopup() {
        this.showJoinTeamPopup = false;
    }

    joinTeam() {
        const team = this.teams.find(t => t.teamCode === this.joinTeamCode);
        if (team) {
            this.hackathons = this.hackathons.map(h => 
                h.id === team.hackathon?.id ? { ...h, joinedTeamId: team.id } : h
            );
            
            
            
            this.closeJoinTeamPopup();
            if (team.id !== undefined) {
                this.openConversation(team.id);
            }
        } else {
            alert('Invalid team code! Please check and try again.');
        }
    }

    openConversation(teamId: number) {
        this.selectedTeamId = teamId;
        const team = this.teams.find(t => t.id === teamId);
        this.selectedTeamName = team?.teamName || '';
        this.showConversationPopup = true;
        this.shouldScroll = true;
        
        // Mark user as online
        if (team) {
            const username = `User${this.userId}`;
            if (!this.onlineMembers.includes(username)) {
                this.onlineMembers.push(username);
            }
        }
    }

    closeConversationPopup() {
        this.showConversationPopup = false;
        this.selectedTeamId = null;
        this.selectedTeamName = '';
        this.newMessage = '';
    }

    sendMessage() {
        if (this.newMessage.trim() && this.selectedTeamId) {
            const newMsg: TeamDiscussion = {
                id: (this.discussions[this.selectedTeamId].length + 1),
                message: this.newMessage,
                teamMember: { user: { username: `User${this.userId}` } },
                createdAt: new Date()
            };
            this.discussions[this.selectedTeamId].push(newMsg);
            this.newMessage = '';
            this.shouldScroll = true;
            
           
    }}


    private sendBotResponse() {
        if (!this.selectedTeamId) return;

        const responses = [
            "That's an interesting idea! What about considering...",
            "I like that approach. We could also think about...",
            "Great suggestion! Here's another angle we might explore...",
            "Has anyone looked into similar implementations before?",
            "We could combine that with what we discussed earlier about...",
            "That sounds promising! How would we handle potential issues with...",
            "I was thinking along similar lines. Maybe we could...",
            "Excellent point! Let me add to that..."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const botMsg: TeamDiscussion = {
            id: (this.discussions[this.selectedTeamId].length + 1),
            message: randomResponse,
            teamMember: { 
                user: { username: 'Bot' }
            },
            createdAt: new Date()
        };
        
        this.discussions[this.selectedTeamId].push(botMsg);
        this.shouldScroll = true;
    }

    getInitials(username: string | undefined | null): string {
        if (!username) return '?';
        const nameParts = username.replace(/^User/, '').trim();
        return nameParts.length > 0 ? nameParts.charAt(0).toUpperCase() : '?';
    }

    isCurrentUser(username: string | undefined | null): boolean {
        return username === `doe${this.userId}`;
    }

    isUserOnline(username: string | undefined | null): boolean {
        return !!username && this.onlineMembers.includes(username);
    }

    private scrollToBottom(): void {
        try {
            setTimeout(() => {
                this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
            }, 0);
        } catch(err) { }
    }
}