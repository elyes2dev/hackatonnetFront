// src/app/demo/components/landing/team/team/team-join/team-join.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Team } from 'src/app/models';
import { TeamControllerService } from 'src/app/services';


@Component({
  selector: 'app-team-join',
  templateUrl: './team-join.component.html',
  styleUrls: ['./team-join.component.scss']
})
export class TeamJoinComponent implements OnInit {
  teamCode: string = '';
  userId: number;
  hackathonId: number;
  publicTeams: Team[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamControllerService
  ) {
    this.userId = +this.route.snapshot.queryParamMap.get('userId')!;
    this.hackathonId = +this.route.snapshot.queryParamMap.get('hackathonId')!;
  }

  ngOnInit() {
    this.loadPublicTeams();
  }

  loadPublicTeams() {
    this.teamService.getAvailablePublicTeams().subscribe({
      next: (teams) => this.publicTeams = teams.filter(team => team.hackathon?.id === this.hackathonId),
      error: (err) => console.error('Failed to load public teams', err)
    });
  }

  joinTeam() {
    this.teamService.joinTeam({ teamCode: this.teamCode, userId: this.userId }).subscribe({
      next: () => {
        this.teamService.getAllTeams().subscribe(teams => {
          const team = teams.find(t => t.teamCode === this.teamCode);
          if (team) {
            this.router.navigate(['/landing/team/frontoffice/conversation', team.id], {
              queryParams: { userId: this.userId }
            });
          }
        });
      },
      error: (err) => console.error('Join failed', err)
    });
  }

  joinPublicTeam(teamId: number) {
    this.teamService.getTeamById({ id: teamId }).subscribe(team => {
      this.teamService.joinTeam({ teamCode: team.teamCode!, userId: this.userId }).subscribe({
        next: () => this.router.navigate(['/landing/team/frontoffice/conversation', teamId], {
          queryParams: { userId: this.userId }
        }),
        error: (err) => console.error('Join public team failed', err)
      });
    });
  }
}