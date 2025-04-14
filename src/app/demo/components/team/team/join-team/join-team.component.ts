import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Add ActivatedRoute
import { TeamControllerService } from 'src/app/services/team-controller.service';
import { JoinTeam$Params } from 'src/app/fn/team-controller/join-team';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-join-team',
  templateUrl: './join-team.component.html',
  styleUrls: ['./join-team.component.scss'],
  providers: [MessageService]
})
export class JoinTeamComponent implements OnInit {
  teamCode: string = '';
  userId: number = 0;

  constructor(
    private teamService: TeamControllerService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute // Inject ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.teamCode = params['teamCode'] || ''; // Prefill teamCode if provided
    });
  }

  onSubmit(): void {
    if (!this.teamCode || !this.userId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Team code and user ID are required.' });
      return;
    }

    const params: JoinTeam$Params = {
      teamCode: this.teamCode,
      userId: this.userId
    };

    this.teamService.joinTeam(params).subscribe({
      next: (response) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Successfully joined the team!' });
        console.log('Join response:', response);
        this.teamCode = '';
        this.userId = 0;
        this.router.navigate(['/teams']);
      },
      error: (err: HttpErrorResponse) => {
        const errorMsg = err.error?.error || 'Unknown error';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to join team: ${errorMsg}` });
        console.error('Join error:', err);
      }
    });
  }
}