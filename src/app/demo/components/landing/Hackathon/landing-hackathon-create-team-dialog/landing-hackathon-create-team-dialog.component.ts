import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-landing-hackathon-create-team-dialog',
  templateUrl: './landing-hackathon-create-team-dialog.component.html',
  styleUrls: ['./landing-hackathon-create-team-dialog.component.scss']
})
export class LandingHackathonCreateTeamDialogComponent {
  @Input() hackathonName: string = '';
  @Output() createTeam = new EventEmitter<{ teamName: string, isPublic: boolean }>();
  @Output() close = new EventEmitter<void>();
  teamName: string = '';
  isPublic: boolean = true;
}
