// src/app/demo/components/landing/team/team/team-create/team-create.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Team } from 'src/app/models';
import { TeamControllerService } from 'src/app/services';


@Component({
  selector: 'app-team-create',
  templateUrl: './team-create.component.html',
  styleUrls: ['./team-create.component.scss']
})
export class TeamCreateComponent implements OnInit {
  team: Team = { teamName: '', isPublic: false };
  hackathonId: number;
  userId: number;
  joinCode: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamControllerService
  ) {
    this.hackathonId = +this.route.snapshot.queryParamMap.get('hackathonId')!;
    this.userId = +this.route.snapshot.queryParamMap.get('userId')!;
  }

  ngOnInit() {}

  createTeam() {
    const teamData: Team = { ...this.team, hackathon: { id: this.hackathonId } };
    this.teamService.createTeam({ hackathonId: this.hackathonId, leaderId: this.userId, body: teamData }).subscribe({
      next: (createdTeam) => {
        this.joinCode = createdTeam.teamCode!;
        alert(`Team created! Join Code: ${this.joinCode}`);
        this.router.navigate(['/landing/team/frontoffice/conversation', createdTeam.id], {
          queryParams: { userId: this.userId }
        });
      },
      error: (err) => console.error('Team creation failed', err)
    });
  }
}