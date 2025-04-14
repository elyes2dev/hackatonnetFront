import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamControllerService } from 'src/app/services/team-controller.service';
import { Team } from 'src/app/models/team';
import { UpdateTeam$Params } from 'src/app/fn/team-controller/update-team';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-update-team',
  templateUrl: './update-team.component.html',
  styleUrls: ['./update-team.component.scss'],
  providers: [MessageService]
})
export class UpdateTeamComponent implements OnInit {
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
  teamId: number | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamControllerService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    console.log('UpdateTeamComponent initialized');
    this.teamId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Team ID from route:', this.teamId);
    if (this.teamId) {
      this.loadTeam(this.teamId);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Team ID not provided.' });
      console.error('No team ID found in route');
    }
  }

  loadTeam(id: number): void {
    console.log('Loading team with ID:', id);
    this.teamService.getTeamById({ id }).subscribe({
      next: (team) => {
        console.log('Team data received:', team);
        this.team = { ...team }; // Deep copy to avoid reference issues
        console.log('Team assigned:', this.team);
      },
      error: (err: HttpErrorResponse) => {
        const errorMsg = err.error?.error || 'Unknown error';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to load team: ${errorMsg}` });
        console.error('Load team error:', err);
      },
      complete: () => {
        console.log('Load team completed, current team:', this.team);
      }
    });
  }

  onSubmit(): void {
    if (!this.teamId || !this.team.teamName) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Team name is required.' });
      return;
    }

    const params: UpdateTeam$Params = {
      id: this.teamId,
      body: this.team
    };

    this.teamService.updateTeam(params).subscribe({
      next: (updatedTeam) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Team updated successfully!' });
        console.log('Team updated:', updatedTeam);
        this.router.navigate(['/teams']);
      },
      error: (err: HttpErrorResponse) => {
        const errorMsg = err.error?.error || 'Unknown error';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to update team: ${errorMsg}` });
        console.error('Update error:', err);
      }
    });
  }
}