import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-landing-hackathon-participate-dialog',
  templateUrl: './landing-hackathon-participate-dialog.component.html',
  styleUrls: ['./landing-hackathon-participate-dialog.component.scss']
})
export class LandingHackathonParticipateDialogComponent {
  @Input() hackathonName: string = '';
  @Output() createTeam = new EventEmitter<void>();
  @Output() joinTeam = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
