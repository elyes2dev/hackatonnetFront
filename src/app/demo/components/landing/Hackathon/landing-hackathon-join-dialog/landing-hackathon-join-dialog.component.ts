import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-landing-hackathon-join-dialog',
  templateUrl: './landing-hackathon-join-dialog.component.html',
  styleUrls: ['./landing-hackathon-join-dialog.component.scss']
})
export class LandingHackathonJoinDialogComponent {
  @Input() hackathonName: string = '';
  @Input() publicTeams: any[] = [];
  @Output() joinByCode = new EventEmitter<string>();
  @Output() joinPublicTeam = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();
  teamCode: string = '';
}
