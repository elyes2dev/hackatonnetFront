import { Component } from '@angular/core';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-hackathon-list',
  templateUrl: './landing-hackathon-list.component.html',
  styleUrls: ['./landing-hackathon-list.component.scss']
})
export class LandingHackathonListComponent {
  hackathons: Hackathon[] = [];  

  constructor(private hackathonService: HackathonService, public router: Router) {}

  ngOnInit() {
    this.loadHackathons();
  }

  loadHackathons() {
    this.hackathonService.getHackathons().subscribe((data: Hackathon[]) => {
      this.hackathons = data;
    });
  }

}
