import { Component } from '@angular/core';

@Component({
  selector: 'app-hackathon-list',
  templateUrl: './hackathon-list.component.html',
  styleUrls: ['./hackathon-list.component.scss']
})
export class HackathonListComponent {
  hackathonService: any;
  hackathons: any[] = [];
  loadHackathons() {
    console.log('Fetching hackathons...');
    this.hackathonService.getAllHackathons().subscribe({
        next: (hackathons: any[]) => {
            console.log('Hackathons received:', hackathons);
            this.hackathons = hackathons;
            console.log('Assigned hackathons:', this.hackathons);
        },
        error: (err: any) => {
            console.error('Failed to load hackathons:', err);
        },
        complete: () => console.log('Hackathon fetch completed')
    });
}

}
