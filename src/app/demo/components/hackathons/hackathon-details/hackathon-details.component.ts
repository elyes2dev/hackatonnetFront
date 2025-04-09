import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';  // Ensure correct path
import { Hackathon } from 'src/app/demo/models/hackathon';  // Ensure correct path


@Component({
  selector: 'app-hackathon-details',
  templateUrl: './hackathon-details.component.html',
  styleUrls: ['./hackathon-details.component.scss']
})
export class HackathonDetailsComponent implements OnInit {
  hackathon: Hackathon | null = null;  // Store selected hackathon
  display: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private hackathonService: HackathonService
  ) {}

  ngOnInit() {
    // Get the 'id' parameter from the route
    const hackathonId = this.route.snapshot.paramMap.get('id');

    if (hackathonId) {
      // Fetch the hackathon details based on the ID
      this.hackathonService.getHackathonById(hackathonId).subscribe((data: Hackathon) => {
        this.hackathon = data;
      });
    }
  }
}

