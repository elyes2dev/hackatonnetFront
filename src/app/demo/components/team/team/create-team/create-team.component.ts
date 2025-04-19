import { Component } from '@angular/core';
import { TeamControllerService } from 'src/app/services/team-controller.service';
import { Team } from 'src/app/models/team';
import { CreateTeam$Params } from 'src/app/fn/team-controller/create-team';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router'; // Add Router

@Component({
  selector: 'app-create-team',
  templateUrl: './create-team.component.html',
  styleUrls: ['./create-team.component.scss'],
  providers: [MessageService]
})
export class CreateTeamComponent {
  team: Team = {
    teamName: '',
    teamCode: '',
    isPublic: true,
    isFull: false,
    joinCodeExpirationTime: undefined,
    createdAt: undefined,
    hackathon: undefined,
    teamMembers: [],
    id: undefined
  };
  hackathonId: number = 0;
  leaderId: number = 0;

  constructor(
    private teamService: TeamControllerService,
    private messageService: MessageService,
    private router: Router // Inject Router
  ) {}

  onSubmit() {
    if (!this.hackathonId || !this.leaderId || !this.team.teamName) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields.' });
      return;
    }

    const params: CreateTeam$Params = {
      hackathonId: this.hackathonId,
      leaderId: this.leaderId,
      body: this.team
    };

    this.teamService.createTeam(params).subscribe({
      next: (response) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Team created successfully!' });
        console.log('Team created:', response);
        this.team.teamName = '';
        this.team.teamCode = '';
        this.hackathonId = 0;
        this.leaderId = 0;
        this.router.navigate(['/teams']); // Navigate to GetAllTeamsComponent
      },
      error: (err: HttpErrorResponse) => {
        const errorMsg = err.error?.error || 'Unknown error';
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: `Failed to create team: ${errorMsg}` 
        });
        console.error('Full error:', err);
      }
    });
  }
}