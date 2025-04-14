import { Component, OnInit } from '@angular/core';
import { TeamControllerService } from 'src/app/services/team-controller.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-leave-team',
  templateUrl: './leave-team.component.html',
  styleUrls: ['./leave-team.component.scss'],
  providers: [MessageService]
})
export class LeaveTeamComponent implements OnInit {
  userId: number = 1; // Default user ID for testing
  teamId: number | undefined;
  submitted: boolean = false;

  constructor(
    private teamService: TeamControllerService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
  }

  confirmLeave(): void {
    this.submitted = true;
    if (!this.teamId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Team ID is required'
      });
      return;
    }

    console.log('Attempting to leave team:', { userId: this.userId, teamId: this.teamId });

    this.teamService.leaveTeam(this.userId, this.teamId).subscribe({
      next: (response) => {
        console.log('Successfully left team:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Successfully left the team'
        });
        this.resetForm();
      },
      error: (error) => {
        console.error('Error leaving team:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.toString()
        });
      }
    });
  }

  resetForm(): void {
    this.teamId = undefined;
    this.submitted = false;
  }
}