import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-live-stream',
  templateUrl: './live-stream.component.html',
  styleUrls: ['./live-stream.component.scss']
})
export class LiveStreamComponent {
  hackathonId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Extract the hackathon ID from the route params
    this.hackathonId = this.route.snapshot.paramMap.get('id');
  }

  startCall() {
    // Instead of generating a random room ID, use the hackathon ID
    // This ensures everyone who accesses this hackathon joins the same room
    if (this.hackathonId) {
      const roomId = `hackathon-${this.hackathonId}`;
      this.router.navigate([`/${this.hackathonId}/call/${roomId}`]);
    } else {
      console.error('Hackathon ID is missing');
    }
  }
  
}

