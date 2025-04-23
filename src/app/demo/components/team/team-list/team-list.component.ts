import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Team } from 'src/app/demo/models/team';
import { TeamService } from 'src/app/demo/services/team.service';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { StorageService } from 'src/app/demo/services/storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss'],
  providers: [MessageService, ConfirmationService]
})

export class TeamListComponent implements OnInit {
  userToken: string | null = null;

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
    // TODO: Implement member adding logic (open dialog to select user, call service)
    // Example: show a modal with user list, then call service to add selected user
    alert('Add member logic for team ' + team.teamName);
  }

  removeMemberFromTeam(team: Team, member: any): void {
    // TODO: Implement member removal logic (call service)
    // Example: call service to remove member from team
    alert('Remove member logic for ' + member.user?.username + ' from team ' + team.teamName);
  }

  manageDiscussions(team: Team): void {
    // TODO: Implement admin-only discussion management logic
    alert('Admin managing discussions for team ' + team.teamName);
  }

  teams: Team[] = [];
  publicTeams: Team[] = [];
  userTeams: Team[] = [];
  isLoading = true;
  displayJoinDialog = false;
  displayCreateDialog = false;
  displayEditDialog = false;
  teamToEdit: Team | null = null;
  teamCode: string = '';
  joinCodeForm: FormGroup;
  createTeamForm: FormGroup;
  editTeamForm: FormGroup;
  selectedHackathonId: number | null = null;
  hackathons: any[] = []; // This would be populated from a HackathonService

  constructor(
    private teamService: TeamService,
    private storageService: StorageService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private hackathonService: HackathonService
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
    
    // Get all public teams
    this.teamService.getAvailablePublicTeams().subscribe({
      next: (teams) => {
        this.publicTeams = teams;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching public teams:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load public teams. Please try again.'
        });
        this.isLoading = false;
      }
    });

    // Get user's teams - this would need to be implemented in your service
    const userId = this.storageService.getLoggedInUserId();
    if (userId) {
      // This is a placeholder - you would need to implement a method to get user's teams
      this.teamService.getAllTeams().subscribe({
        next: (allTeams) => {
          // Filter teams where the user is a member (this is just a placeholder)
          // In a real implementation, you would have a backend endpoint for this
          this.userTeams = allTeams.filter(team => 
            team.teamMembers?.some(member => member.user && member.user.id === userId)
          );
        },
        error: (error) => {
          console.error('Error fetching user teams:', error);
        }
      });
    }
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
          // If valid, join the team
          this.teamService.joinTeam(code).subscribe({
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
        this.teamService.joinTeam(team.teamCode).subscribe({
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
      }
    });
  }

  viewTeam(team: Team): void {
    this.router.navigate(['/teams', team.id]);
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
}
