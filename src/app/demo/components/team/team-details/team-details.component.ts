import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Team } from 'src/app/demo/models/team';
import { TeamMember } from 'src/app/demo/models/team-members';
import { TeamService } from 'src/app/demo/services/team.service';
import { TeamMembersService } from 'src/app/demo/services/team-members.service';
import { StorageService } from 'src/app/demo/services/storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-team-details',
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class TeamDetailsComponent implements OnInit {
  team: Team | null = null;
  teamMembers: TeamMember[] = [];
  isLoading = true;
  isCurrentUserTeamLeader = false;
  isCurrentUserTeamMember = false;
  currentUserId: number | null = null;
  currentUserTeamMemberId: number | null = null;
  displayEditDialog = false;
  displayInviteDialog = false;
  editTeamForm: FormGroup;
  inviteForm: FormGroup;
  teamCode: string = '';
  showCode = false;
  codeExpiration: Date | null = null;
  
  // Getter for team visibility status
  get isTeamPublic(): boolean {
    return this.editTeamForm?.get('isPublic')?.value === true;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private teamMembersService: TeamMembersService,
    private storageService: StorageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.editTeamForm = this.fb.group({
      teamName: ['', [Validators.required, Validators.minLength(3)]],
      isPublic: [true]
    });

    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.storageService.getLoggedInUserId();
    
    // Check if we're joining via code
    const teamCode = this.route.snapshot.paramMap.get('teamCode');
    if (teamCode) {
      this.joinTeamByCode(teamCode);
    } else {
      // Regular team details view
      const teamId = this.route.snapshot.paramMap.get('teamId');
      if (teamId) {
        this.loadTeamDetails(+teamId);
      } else {
        this.router.navigate(['/teams']);
      }
    }
  }

  loadTeamDetails(teamId: number): void {
    this.isLoading = true;
    
    this.teamService.getTeamById(teamId).subscribe({
      next: (team) => {
        this.team = team;
        this.teamCode = team.teamCode || '';
        
        if (team.joinCodeExpirationTime) {
          this.codeExpiration = new Date(team.joinCodeExpirationTime);
        }
        
        this.loadTeamMembers(teamId);
        
        this.editTeamForm.patchValue({
          teamName: team.teamName,
          isPublic: team.isPublic
        });
        
        this.isLoading = false;
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
        console.log('Team members data:', JSON.stringify(members, null, 2));
        this.teamMembers = members;
        
        // Check if current user is a team member
        if (this.currentUserId) {
          const currentUserMember = members.find(member => member.user?.id === this.currentUserId);
          
          if (currentUserMember) {
            this.isCurrentUserTeamMember = true;
            this.currentUserTeamMemberId = currentUserMember.id;
            this.isCurrentUserTeamLeader = currentUserMember.role === 'LEADER';
          }
        }
      },
      error: (error) => {
        console.error('Error fetching team members:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load team members. Please try again.'
        });
      }
    });
  }

  joinTeamByCode(code: string): void {
    this.teamService.validateTeamCode(code).subscribe({
      next: (response) => {
        if (response.valid) {
          this.teamService.joinTeam(code).subscribe({
            next: (team) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `You have joined team ${team.teamName}`
              });
              this.router.navigate(['/teams', team.id]);
            },
            error: (error) => {
              console.error('Error joining team:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Failed to join team. Please try again.'
              });
              this.router.navigate(['/teams']);
            }
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Invalid Code',
            detail: 'The team code is invalid or has expired'
          });
          this.router.navigate(['/teams']);
        }
      },
      error: (error) => {
        console.error('Error validating team code:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to validate team code. Please try again.'
        });
        this.router.navigate(['/teams']);
      }
    });
  }

  openEditDialog(): void {
    if (this.team) {
      this.editTeamForm.patchValue({
        teamName: this.team.teamName,
        isPublic: this.team.isPublic
      });
      this.displayEditDialog = true;
    }
  }

  openInviteDialog(): void {
    this.inviteForm.reset();
    this.displayInviteDialog = true;
  }

  updateTeam(): void {
    if (this.editTeamForm.invalid || !this.team) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields'
      });
      return;
    }

    const formValue = this.editTeamForm.value;
    const updatedTeam: Team = {
      ...this.team,
      teamName: formValue.teamName,
      isPublic: formValue.isPublic
    };

    this.teamService.updateTeam(updatedTeam).subscribe({
      next: (team) => {
        this.team = team;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Team updated successfully'
        });
        this.displayEditDialog = false;
      },
      error: (error) => {
        console.error('Error updating team:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to update team. Please try again.'
        });
      }
    });
  }

  regenerateTeamCode(): void {
    if (!this.team) return;
    
    this.confirmationService.confirm({
      message: 'Are you sure you want to regenerate the team code? The old code will no longer work.',
      header: 'Confirm Regeneration',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.teamService.regenerateTeamCode(this.team!.id).subscribe({
          next: (response) => {
            this.teamCode = response.teamCode;
            this.showCode = true;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Team code regenerated successfully'
            });
          },
          error: (error) => {
            console.error('Error regenerating team code:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to regenerate team code. Please try again.'
            });
          }
        });
      }
    });
  }

  inviteByEmail(): void {
    if (this.inviteForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a valid email address'
      });
      return;
    }

    const email = this.inviteForm.get('email')?.value;
    
    // This would be implemented in your backend
    // For now, we'll just show a success message
    this.messageService.add({
      severity: 'success',
      summary: 'Invitation Sent',
      detail: `Invitation sent to ${email}`
    });
    this.displayInviteDialog = false;
  }

  leaveTeam(): void {
    if (!this.team) return;
    
    this.confirmationService.confirm({
      message: 'Are you sure you want to leave this team? You will lose access to team discussions.',
      header: 'Confirm Leave',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.teamService.leaveTeam(this.team!.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'You have left the team'
            });
            this.router.navigate(['/teams']);
          },
          error: (error) => {
            console.error('Error leaving team:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to leave team. Please try again.'
            });
          }
        });
      }
    });
  }

  removeTeamMember(memberId: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this member from the team?',
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.teamMembersService.deleteTeamMember(memberId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Member removed successfully'
            });
            // Refresh team members list
            if (this.team) {
              this.loadTeamMembers(this.team.id);
            }
          },
          error: (error) => {
            console.error('Error removing team member:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to remove team member. Please try again.'
            });
          }
        });
      }
    });
  }

  promoteToLeader(memberId: number): void {
    const member = this.teamMembers.find(m => m.id === memberId);
    if (!member) return;
    
    this.confirmationService.confirm({
      message: `Are you sure you want to promote ${member.user?.name || 'this user'} to team leader? You will become a regular member.`,
      header: 'Confirm Promotion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // This would require a backend endpoint to handle leadership transfer
        // For now, we'll just show a success message
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${member.user?.name || 'The selected user'} is now the team leader`
        });
        
        // In a real implementation, you would call an API and then refresh the data
        // For demo purposes, we'll manually update the roles
        const currentLeader = this.teamMembers.find(m => m.role === 'LEADER');
        if (currentLeader) {
          currentLeader.role = 'MEMBER';
        }
        member.role = 'LEADER';
        
        this.isCurrentUserTeamLeader = this.currentUserTeamMemberId === memberId;
      }
    });
  }

  deleteTeam(): void {
    if (!this.team) return;
    
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this team? This action cannot be undone.',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.teamService.deleteTeam(this.team!.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Team deleted successfully'
            });
            this.router.navigate(['/teams']);
          },
          error: (error) => {
            console.error('Error deleting team:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to delete team. Please try again.'
            });
          }
        });
      }
    });
  }

  copyTeamCode(): void {
    navigator.clipboard.writeText(this.teamCode).then(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Team code copied to clipboard'
        });
      },
      () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to copy team code'
        });
      }
    );
  }

  goToChat(): void {
    if (this.team) {
      this.router.navigate(['/teams', this.team.id, 'chat']);
    }
  }

  goBack(): void {
    this.router.navigate(['/teams']);
  }

  // Helper method to get user display name
  getUserDisplayName(member: TeamMember): string {
    if (!member.user) return 'Unknown User';
    
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
  getUserAvatarLabel(member: TeamMember): string {
    if (!member.user) return '?';
    
    if (member.user.name) {
      return member.user.name.charAt(0);
    }
    
    if (member.user.email) {
      return member.user.email.charAt(0);
    }
    
    return '?';
  }
}
