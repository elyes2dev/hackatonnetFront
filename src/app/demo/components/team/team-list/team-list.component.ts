import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Team } from 'src/app/demo/models/team';
import { User } from 'src/app/demo/models/user.model'; // Updated to use the full User model
import { TeamService } from 'src/app/demo/services/team.service';
import { UserService } from 'src/app/demo/services/user.service';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { StorageService } from 'src/app/demo/services/storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { jwtDecode } from 'jwt-decode';
import { MentorRecommendationService } from 'src/app/demo/services/mentor-recommendation.service';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss'],
  providers: [MessageService, ConfirmationService]
})

export class TeamListComponent implements OnInit {
  userToken: string | null = null;
  displayAddMemberDialog = false;
  availableUsers: any[] = [];
  selectedUser: any = null;
  teamStats = {
    totalTeams: 0,
    totalMembers: 0,
    avgTeamSize: 0,
    publicTeamsCount: 0,
    privateTeamsCount: 0,
    activeTeams: 0,
    inactiveTeams: 0,
    teamsByHackathon: [] as {name: string, count: number}[],
    memberRoleDistribution: {leader: 0, member: 0}
  };
  
  // Chart data
  teamDistributionData: any;
  teamDistributionOptions: any;
  memberActivityData: any;
  memberActivityOptions: any;
  teamSizeData: any;
  teamSizeOptions: any;

  displayMentorDialog = false;
  availableMentors: User[] = [];
  selectedMentor: User | null = null;

  isAdmin(): boolean {
    if (!this.userToken) return false;
    try {
      const decoded: any = jwtDecode(this.userToken);
      return decoded.roles && decoded.roles.includes('admin');
    } catch (e) {
      return false;
    }
  }

  addMemberToTeam(team: Team): void {
    if (!this.isAdmin()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Only administrators can add team members'
      });
      return;
    }

    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        // Filter out users who are already in the team
        this.availableUsers = users.filter((user: User) => 
          !team.teamMembers?.some(member => member.user?.id === user.id)
        );
        this.selectedUser = null;
        this.teamToEdit = team;
        this.displayAddMemberDialog = true;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load available users'
        });
      }
    });
  }

  confirmAddMember(): void {
    if (!this.selectedUser || !this.teamToEdit) return;

    this.teamService.addTeamMember(this.teamToEdit.id, this.selectedUser.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Added ${this.selectedUser.name} to team ${this.teamToEdit?.teamName}`
        });
        this.displayAddMemberDialog = false;
        this.loadTeams();
      },
      error: (error: any) => {
        console.error('Error adding member:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to add team member'
        });
      }
    });
  }

  removeMemberFromTeam(team: Team, member: any): void {
    if (!this.isAdmin()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Only administrators can remove team members'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to remove ${this.getUserDisplayName(member)} from team "${team.teamName}"?`,
      header: 'Remove Member Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.teamService.removeTeamMember(team.id, member.user.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Member removed from team ${team.teamName}`
            });
            this.loadTeams();
          },
          error: (error: any) => {
            console.error('Error removing member:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to remove team member'
            });
          }
        });
      }
    });
  }

  manageDiscussions(team: Team): void {
    // TODO: Implement admin-only discussion management logic
    alert('Admin managing discussions for team ' + team.teamName);
  }

  teams: Team[] = [];
  publicTeams: Team[] = [];
  filteredPublicTeams: Team[] = [];
  userTeams: Team[] = [];
  teamsByHackathon: { [key: string]: Team[] } = {}; // Teams grouped by hackathon
  hackathonNames: string[] = []; // List of hackathon names for display
  isLoading = true;
  displayJoinDialog = false;
  displayCreateDialog = false;
  displayEditDialog = false;
  displayQuickStatsDialog = false;
  displayChartsSection = false; // Control visibility of charts section
  teamToEdit: Team | null = null;
  selectedTeamForStats: Team | null = null;
  teamCode: string = '';
  joinCodeForm: FormGroup;
  createTeamForm: FormGroup;
  editTeamForm: FormGroup;
  selectedHackathonId: number | null = null;
  teamFilterHackathonId: number | null = null;
  teamSearchQuery: string = '';
  teamViewMode: 'grid' | 'list' = 'grid';
  hackathons: any[] = []; // This would be populated from a HackathonService

// In team-list.component.ts - Add these properties


  constructor(
    private teamService: TeamService,
    private storageService: StorageService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private hackathonService: HackathonService,
    private userService: UserService,
    private mentorService: MentorRecommendationService,

  ) {
    this.joinCodeForm = this.fb.group({
      teamCode: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.createTeamForm = this.fb.group({
      teamName: ['', [Validators.required, Validators.minLength(3)]],
      isPublic: [true],
      hackathonId: [null, Validators.required]
    });

    this.editTeamForm = this.fb.group({
      teamName: ['', [Validators.required, Validators.minLength(3)]],
      isPublic: [true]
    });
  }

  ngOnInit(): void {
    this.userToken = localStorage.getItem('authToken');
    this.loadTeams();
    this.loadHackathons();
    this.initializeChartOptions();
  }
  
  initializeChartOptions(): void {
    // Common options for all charts
    const commonOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        r: {
          grid: {
            color: '#ebedef'
          }
        },
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        }
      }
    };
    
    // Team distribution options
    this.teamDistributionOptions = {
      ...commonOptions,
      cutout: '60%',
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: 'Team Distribution',
          font: {
            size: 16
          }
        }
      }
    };
    
    // Member activity options
    this.memberActivityOptions = {
      ...commonOptions,
      aspectRatio: 1.5,
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: 'Team Member Roles',
          font: {
            size: 16
          }
        }
      }
    };
    
    // Team size options
    this.teamSizeOptions = {
      ...commonOptions,
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: 'Team Size Distribution',
          font: {
            size: 16
          }
        }
      }
    };
  }
  
  initializeCharts(teamSizes: {[key: string]: number}): void {
    // Team distribution chart (public vs private)
    this.teamDistributionData = {
      labels: ['Public Teams', 'Private Teams'],
      datasets: [
        {
          data: [this.teamStats.publicTeamsCount, this.teamStats.privateTeamsCount],
          backgroundColor: ['#42A5F5', '#FF7043'],
          hoverBackgroundColor: ['#64B5F6', '#FF8A65']
        }
      ]
    };
    
    // Member activity chart (leaders vs members)
    this.memberActivityData = {
      labels: ['Team Leaders', 'Team Members'],
      datasets: [
        {
          data: [this.teamStats.memberRoleDistribution.leader, this.teamStats.memberRoleDistribution.member],
          backgroundColor: ['#FFD700', '#2196F3'],
          hoverBackgroundColor: ['#FFC107', '#1E88E5']
        }
      ]
    };
    
    // Team size distribution chart
    this.teamSizeData = {
      labels: Object.keys(teamSizes),
      datasets: [
        {
          label: 'Number of Teams',
          data: Object.values(teamSizes),
          backgroundColor: '#4CAF50',
          borderColor: '#388E3C',
          borderWidth: 1
        }
      ]
    };
  }

  loadHackathons(): void {
    this.hackathonService.getHackathons().subscribe({
      next: (hackathons: Hackathon[]) => {
        // Map hackathons to format expected by dropdown
        this.hackathons = hackathons.map(h => ({
          id: h.id,
          name: h.title
        }));
        console.log('Loaded hackathons:', this.hackathons);
      },
      error: (error) => {
        console.error('Error loading hackathons:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load hackathons. Please refresh the page.'
        });
      }
    });
  }

  loadTeams(): void {
    this.isLoading = true;
    
    // Get all teams for statistics
    this.teamService.getAllTeams().subscribe({
      next: (allTeams) => {
        this.calculateTeamStats(allTeams);
        
        // Filter public teams
        this.publicTeams = allTeams.filter(team => team.isPublic);
        this.filteredPublicTeams = [...this.publicTeams]; // Initialize filtered teams
        
        // Get user's teams
        const userId = this.storageService.getLoggedInUserId();
        if (userId) {
          this.userTeams = allTeams.filter(team => 
            team.teamMembers?.some(member => member.user && member.user.id === userId)
          );
        }
        
        // Group teams by hackathon
        this.groupTeamsByHackathon(allTeams);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching teams:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load teams. Please try again.'
        });
        this.isLoading = false;
      }
    });
  }
  
  groupTeamsByHackathon(teams: Team[]): void {
    // Reset the groupings
    this.teamsByHackathon = {};
    this.hackathonNames = [];
    
    // Create a group for teams without a hackathon
    this.teamsByHackathon['Unassigned'] = [];
    
    // Group teams by hackathon
    teams.forEach(team => {
      if (team.hackathon && team.hackathon.title) {
        const hackathonName = team.hackathon.title;
        
        if (!this.teamsByHackathon[hackathonName]) {
          this.teamsByHackathon[hackathonName] = [];
          this.hackathonNames.push(hackathonName);
        }
        
        this.teamsByHackathon[hackathonName].push(team);
      } else {
        this.teamsByHackathon['Unassigned'].push(team);
      }
    });
    
    // Sort hackathon names alphabetically
    this.hackathonNames.sort();
    
    // Add 'Unassigned' at the end if it has teams
    if (this.teamsByHackathon['Unassigned'].length > 0) {
      this.hackathonNames.push('Unassigned');
    }
  }
  
  filterTeams(): void {
    // Start with all public teams
    let filtered = [...this.publicTeams];
    
    // Apply search query filter if it exists
    if (this.teamSearchQuery && this.teamSearchQuery.trim() !== '') {
      const query = this.teamSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(team => 
        team.teamName.toLowerCase().includes(query) ||
        (team.hackathon?.title && team.hackathon.title.toLowerCase().includes(query))
      );
    }
    
    // Apply hackathon filter if selected
    if (this.teamFilterHackathonId) {
      filtered = filtered.filter(team => 
        team.hackathon && team.hackathon.id === this.teamFilterHackathonId
      );
    }
    
    // Update filtered teams
    this.filteredPublicTeams = filtered;
  }

  calculateTeamStats(teams: Team[]): void {
    // Basic stats
    this.teamStats.totalTeams = teams.length;
    this.teamStats.publicTeamsCount = teams.filter(t => t.isPublic).length;
    this.teamStats.privateTeamsCount = teams.filter(t => !t.isPublic).length;
    
    // Member counts
    let totalMembers = 0;
    let leaderCount = 0;
    let regularMemberCount = 0;
    
    // Team activity (consider a team active if it has at least 3 members)
    this.teamStats.activeTeams = teams.filter(t => (t.teamMembers?.length || 0) >= 3).length;
    this.teamStats.inactiveTeams = teams.length - this.teamStats.activeTeams;
    
    // Team size distribution for chart
    const teamSizes: {[key: string]: number} = {
      'Small (1-2)': 0,
      'Medium (3-5)': 0,
      'Large (6+)': 0
    };
    
    // Teams by hackathon
    const hackathonMap = new Map<number, {name: string, count: number}>();
    
    teams.forEach(team => {
      const teamMemberCount = team.teamMembers?.length || 0;
      totalMembers += teamMemberCount;
      
      // Count roles
      team.teamMembers?.forEach(member => {
        if (member.role === 'LEADER') {
          leaderCount++;
        } else {
          regularMemberCount++;
        }
      });
      
      // Team size categorization
      if (teamMemberCount <= 2) {
        teamSizes['Small (1-2)']++;
      } else if (teamMemberCount <= 5) {
        teamSizes['Medium (3-5)']++;
      } else {
        teamSizes['Large (6+)']++;
      }
      
      // Hackathon tracking
      if (team.hackathon) {
        const hackathonId = team.hackathon.id;
        if (hackathonMap.has(hackathonId)) {
          const entry = hackathonMap.get(hackathonId)!;
          entry.count++;
          hackathonMap.set(hackathonId, entry);
        } else {
          hackathonMap.set(hackathonId, {
            name: team.hackathon.title || `Hackathon ${hackathonId}`,
            count: 1
          });
        }
      }
    });
    
    // Set calculated stats
    this.teamStats.totalMembers = totalMembers;
    this.teamStats.avgTeamSize = teams.length > 0 ? 
      Math.round((totalMembers / teams.length) * 10) / 10 : 0;
    this.teamStats.memberRoleDistribution = {
      leader: leaderCount,
      member: regularMemberCount
    };
    
    // Convert hackathon map to array
    this.teamStats.teamsByHackathon = Array.from(hackathonMap.values());
    
    // Initialize chart data
    this.initializeCharts(teamSizes);
  }

  openJoinDialog(): void {
    this.displayJoinDialog = true;
    this.joinCodeForm.reset();
  }

  openCreateDialog(): void {
    this.displayCreateDialog = true;
    this.createTeamForm.reset();
    this.createTeamForm.patchValue({
      isPublic: true
    });
  }

  joinTeamByCode(): void {
    if (this.joinCodeForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a valid team code'
      });
      return;
    }

    const code = this.joinCodeForm.get('teamCode')?.value;
    
    // First validate the code
    this.teamService.validateTeamCode(code).subscribe({
      next: (response) => {
        if (response.valid) {
          // If valid, join the team (need hackathonId)
          let hackathonId: number | null = null;
          // Try to get from selectedHackathonId or from hackathons dropdown
          if (this.selectedHackathonId) {
            hackathonId = this.selectedHackathonId;
          } else if (this.hackathons && this.hackathons.length > 0) {
            // fallback: take the first hackathon
            hackathonId = this.hackathons[0].id;
          }
          if (!hackathonId) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Hackathon ID is required to join by code.'
            });
            return;
          }
          this.teamService.joinTeamByCode(code, hackathonId).subscribe({
            next: (team) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `You have joined team ${team.teamName}`
              });
              this.displayJoinDialog = false;
              this.router.navigate(['/teams', team.id]);
            },
            error: (error) => {
              console.error('Error joining team:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Failed to join team. Please try again.'
              });
            }
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Invalid Code',
            detail: 'The team code is invalid or has expired'
          });
        }
      },
      error: (error) => {
        console.error('Error validating team code:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to validate team code. Please try again.'
        });
      }
    });
  }

  createTeam(): void {
    if (this.createTeamForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields'
      });
      return;
    }

    const formValue = this.createTeamForm.value;
    // Create a simpler object without ID to avoid database conflicts
    const newTeam = {
      teamName: formValue.teamName,
      isPublic: formValue.isPublic
      // Let the backend handle teamCode and other properties
    };

    const hackathonId = formValue.hackathonId;

    this.teamService.createTeam(newTeam, hackathonId).subscribe({
      next: (team) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Team ${team.teamName} created successfully`
        });
        this.displayCreateDialog = false;
        this.router.navigate(['/teams', team.id]);
      },
      error: (error) => {
        console.error('Error creating team:', error);
        let errorMessage = 'Failed to create team. Please try again.';
        
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 400) {
          errorMessage = 'Invalid team data. Please check all fields and try again.';
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error Creating Team',
          detail: errorMessage,
          life: 5000
        });
      }
    });
  }

  joinPublicTeam(team: Team): void {
    if (!team.teamCode) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Team code is missing. Cannot join team.'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to join the team "${team.teamName}"?`,
      header: 'Join Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Prefer joining by team ID if available
        if (team.id) {
          this.teamService.joinTeam(team.id).subscribe({
            next: (joinedTeam) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `You have joined team ${joinedTeam.teamName}`
              });
              this.router.navigate(['/teams', joinedTeam.id]);
            },
            error: (error) => {
              console.error('Error joining team:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Failed to join team. Please try again.'
              });
            }
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Team ID is missing. Cannot join team.'
          });
        }
      }
    });
  }

  viewTeam(team: Team): void {
    this.router.navigate(['/teams', team.id]);
  }
  
  showTeamQuickStats(team: Team): void {
    this.selectedTeamForStats = team;
    this.displayQuickStatsDialog = true;
  }
  
  viewTeamAndCloseStats(team: Team): void {
    this.displayQuickStatsDialog = false;
    this.viewTeam(team);
  }
  
  toggleChartsSection(): void {
    this.displayChartsSection = !this.displayChartsSection;
  }
  
  getTeamMemberCountByRole(team: Team, role: string): number {
    if (!team.teamMembers) return 0;
    return team.teamMembers.filter(member => member.role === role).length;
  }
  
  copyTeamCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied!',
        detail: 'Team code copied to clipboard',
        life: 3000
      });
    }, (err) => {
      console.error('Could not copy text: ', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to copy team code',
        life: 3000
      });
    });
  }

  openEditDialog(team: Team): void {
    this.teamToEdit = team;
    this.editTeamForm.patchValue({
      teamName: team.teamName,
      isPublic: team.isPublic
    });
    this.displayEditDialog = true;
  }

  updateTeam(): void {
    if (this.editTeamForm.invalid || !this.teamToEdit) return;
    const updatedTeam: Team = {
      ...this.teamToEdit,
      teamName: this.editTeamForm.value.teamName,
      isPublic: this.editTeamForm.value.isPublic
    };
    this.teamService.updateTeam(updatedTeam).subscribe({
      next: (team) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Team updated successfully' });
        this.displayEditDialog = false;
        this.loadTeams();
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to update team.' });
      }
    });
  }

  // Helper method to get user display name
  getUserDisplayName(member: any): string {
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
  
  // Helper method to get the first letter for avatar
  getUserAvatarLabel(member: any): string {
    if (!member || !member.user) return '?';
    
    if (member.user.name) {
      return member.user.name.charAt(0);
    }
    
    if (member.user.email) {
      return member.user.email.charAt(0);
    }
    
    return '?';
  }

// Add this method to open the mentor dialog
assignMentorToTeam(team: Team): void {
  if (!team || !team.hackathon || !team.hackathon.id) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Team must be associated with a hackathon to assign mentors'
    });
    return;
  }

  const hackathonId = team.hackathon.id;
  this.teamToEdit = team;
  
  // Get available mentors for this hackathon
  this.teamService.getAvailableMentorsForHackathon(hackathonId).subscribe({
    next: (mentors: User[]) => {
      this.availableMentors = mentors;
      this.selectedMentor = null;
      this.displayMentorDialog = true;
    },
    error: (error: any) => {
      console.error('Error loading mentors:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load available mentors'
      });
    }
  });
}

// Add this method to confirm mentor assignment
confirmMentorAssignment(): void {
  if (!this.selectedMentor || !this.teamToEdit) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Please select a mentor to assign'
    });
    return;
  }

  this.teamService.assignMentorToTeam(this.teamToEdit.id, this.selectedMentor.id).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `Mentor ${this.selectedMentor?.name || 'Unknown'} assigned to team ${this.teamToEdit?.teamName}`
      });
      this.displayMentorDialog = false;
      this.loadTeams(); // Reload teams to reflect changes
    },
    error: (error: any) => {
      console.error('Error assigning mentor:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to assign mentor to team'
      });
    }
  });
}

// Utility method to check if team already has a mentor - added null safety
teamHasMentor(team: Team | null): boolean {
  if (!team) return false;
  return team.teamMembers?.some(member => member.role === 'MENTOR') || false;
}

// Method to get current mentor name if exists - added null safety
getCurrentMentorName(team: Team | null): string {
  if (!team) return 'None';
  
  const mentorMember = team.teamMembers?.find(member => member.role === 'MENTOR');
  if (mentorMember && mentorMember.user) {
    return this.getUserDisplayName(mentorMember);
  }
  return 'None';
}


// Add these new methods to the TeamListComponent class

/**
 * Get hackathon ID by its name (title)
 * @param hackathonName The name of the hackathon
 * @returns The ID of the hackathon or null if not found
 */
getHackathonIdByName(hackathonName: string): number | null {
  if (hackathonName === 'Unassigned') return null;
  
  const hackathon = this.hackathons.find(h => h.name === hackathonName);
  return hackathon ? hackathon.id : null;
}

/**
 * Stop event propagation to prevent accordion from toggling
 * @param event The click event
 */
stopPropagation(event: Event): void {
  event.stopPropagation();
}

/**
 * Assign mentors to all teams in a hackathon using smart recommendation
 * @param event The click event
 * @param hackathonId The ID of the hackathon
 */
assignMentorsToHackathon(event: Event, hackathonId: number | null): void {
  // Stop event propagation to prevent accordion toggle
  event.stopPropagation();
  
  if (!hackathonId) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Could not determine hackathon ID'
    });
    return;
  }
  
  // Confirm before proceeding
  this.confirmationService.confirm({
    message: 'This will automatically assign mentors to all teams in this hackathon based on AI recommendations. Do you want to proceed?',
    header: 'Smart Mentor Assignment',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      // Show loading indicator
      this.messageService.add({
        severity: 'info',
        summary: 'Processing',
        detail: 'Assigning mentors to teams...',
        sticky: true,
        key: 'mentor-assignment'
      });
      
      // Get teams for this hackathon
      const hackathonName = this.hackathons.find(h => h.id === hackathonId)?.name || '';
      const teamsForHackathon = this.teamsByHackathon[hackathonName] || [];
      
      // Counter for completed operations
      let completedCount = 0;
      let successCount = 0;
      const totalTeams = teamsForHackathon.length;
      
      // Get available mentors for the hackathon
      this.mentorService.getAvailableMentorsForHackathon(hackathonId).subscribe({
        next: (mentors: User[]) => {
          if (mentors.length === 0) {
            this.messageService.clear('mentor-assignment');
            this.messageService.add({
              severity: 'warn',
              summary: 'No Mentors',
              detail: 'There are no available mentors for this hackathon'
            });
            return;
          }
          
          // Process each team that doesn't already have a mentor
          const teamsWithoutMentors = teamsForHackathon.filter(team => !this.teamHasMentor(team));
          
          if (teamsWithoutMentors.length === 0) {
            this.messageService.clear('mentor-assignment');
            this.messageService.add({
              severity: 'info',
              summary: 'Complete',
              detail: 'All teams in this hackathon already have mentors assigned'
            });
            return;
          }
          
          // Create a map to track mentor assignments and availability
          const mentorAssignmentMap = new Map<number, {assigned: number, maxTeams: number}>();
          
          // Initialize the mentor assignment map
          mentors.forEach(mentor => {
            mentorAssignmentMap.set(mentor.id, {assigned: 0, maxTeams: 0});
          });
          
          // Load current mentor assignments and availability
          const availabilityChecks = mentors.map(mentor => 
            this.mentorService.checkMentorAvailability(mentor.id, hackathonId)
              .toPromise()
              .then(result => {
                if (result) {
                  mentorAssignmentMap.set(mentor.id, {
                    assigned: result.currentTeams,
                    maxTeams: result.maxTeams
                  });
                }
              })
              .catch(error => {
                console.error(`Error checking availability for mentor ${mentor.id}:`, error);
              })
          );
          
          // Wait for all availability checks to complete before proceeding
          Promise.all(availabilityChecks).then(() => {
            // Filter out mentors who are already at max capacity
            const availableMentors = mentors.filter(mentor => {
              const info = mentorAssignmentMap.get(mentor.id);
              return info && info.assigned < info.maxTeams;
            });
            
            if (availableMentors.length === 0) {
              this.messageService.clear('mentor-assignment');
              this.messageService.add({
                severity: 'warn',
                summary: 'No Available Mentors',
                detail: 'All mentors have reached their maximum team capacity'
              });
              return;
            }
            
            // Assign mentors to each team, respecting capacity limits
            teamsWithoutMentors.forEach(team => {
              // Get recommended mentors for this team (only available ones)
              this.mentorService.getAvailableMentorRecommendations(team.id, hackathonId).subscribe({
                next: (recommendation: any) => {
                  let mentorToAssign: User | null = null;
                  
                  // Find the best available mentor
                  if (recommendation && recommendation.recommendedMentors && recommendation.recommendedMentors.length > 0) {
                    // Try each recommended mentor in order until finding an available one
                    for (const candidate of recommendation.recommendedMentors) {
                      const info = mentorAssignmentMap.get(candidate.id);
                      if (info && info.assigned < info.maxTeams) {
                        mentorToAssign = candidate;
                        break;
                      }
                    }
                  }
                  
                  // If no available recommended mentor, try a random available one
                  if (!mentorToAssign && availableMentors.length > 0) {
                    // Find mentors who still have capacity
                    const mentorsWithCapacity = availableMentors.filter(m => {
                      const info = mentorAssignmentMap.get(m.id);
                      return info && info.assigned < info.maxTeams;
                    });
                    
                    if (mentorsWithCapacity.length > 0) {
                      // Choose the mentor with the most remaining capacity
                      mentorsWithCapacity.sort((a, b) => {
                        const infoA = mentorAssignmentMap.get(a.id)!;
                        const infoB = mentorAssignmentMap.get(b.id)!;
                        return (infoB.maxTeams - infoB.assigned) - (infoA.maxTeams - infoA.assigned);
                      });
                      
                      mentorToAssign = mentorsWithCapacity[0];
                    }
                  }
                  
                  if (mentorToAssign) {
                    // Assign the mentor to the team
                    this.teamService.assignMentorToTeam(team.id, mentorToAssign.id).subscribe({
                      next: () => {
                        // Update the mentor's assignment count
                        const info = mentorAssignmentMap.get(mentorToAssign!.id);
                        if (info) {
                          info.assigned++;
                          mentorAssignmentMap.set(mentorToAssign!.id, info);
                        }
                        
                        successCount++;
                        completedCount++;
                        checkIfComplete();
                      },
                      error: (error) => {
                        console.error(`Error assigning mentor to team ${team.teamName}:`, error);
                        completedCount++;
                        checkIfComplete();
                      }
                    });
                  } else {
                    // No available mentors left
                    this.messageService.add({
                      severity: 'warn',
                      summary: 'No Capacity',
                      detail: `Couldn't assign a mentor to team ${team.teamName} - all mentors at capacity`,
                      life: 5000
                    });
                    completedCount++;
                    checkIfComplete();
                  }
                },
                error: (error) => {
                  console.error(`Error getting mentor recommendations for team ${team.teamName}:`, error);
                  completedCount++;
                  checkIfComplete();
                }
              });
            });
            
            // Check if all operations are complete
            const checkIfComplete = () => {
              if (completedCount === teamsWithoutMentors.length) {
                this.messageService.clear('mentor-assignment');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Assignment Complete',
                  detail: `Successfully assigned mentors to ${successCount} out of ${teamsWithoutMentors.length} teams`
                });
                // Reload teams to reflect the changes
                this.loadTeams();
              }
            };
          });
        },
        error: (error) => {
          this.messageService.clear('mentor-assignment');
          console.error('Error loading mentors for hackathon:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load mentors for this hackathon'
          });
        }
      });
    }
  });
}
}
