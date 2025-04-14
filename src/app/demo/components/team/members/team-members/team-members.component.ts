import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamMembersControllerService } from 'src/app/services/team-members-controller.service';
import { TeamMembers } from 'src/app/models/team-members';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-team-members',
  templateUrl: './team-members.component.html',
  styleUrls: ['./team-members.component.scss'],
  providers: [MessageService]
})
export class TeamMembersComponent implements OnInit {
  teamId: number = 0;
  teamMembers: TeamMembers[] = [];

  constructor(
    private route: ActivatedRoute,
    private teamMembersService: TeamMembersControllerService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.teamId = Number(this.route.snapshot.paramMap.get('teamId')) || 0;
    if (this.teamId) {
      this.loadTeamMembers(this.teamId);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Team ID not provided.' });
    }
  }

  loadTeamMembers(teamId: number): void {
    this.teamMembersService.getTeamMembersByTeamId({ teamId }).subscribe({
      next: (members: TeamMembers[]) => {
        this.teamMembers = members || [];
        console.log('Team members loaded:', this.teamMembers);
      },
      error: (err: HttpErrorResponse) => {
        const errorMsg = err.error?.error || 'Unknown error';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to load team members: ${errorMsg}` });
        console.error('Load team members error:', err);
      }
    });
  }
}