import { Component, OnInit } from '@angular/core';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { Hackathon } from 'src/app/demo/models/hackathon';

@Component({
  selector: 'app-hackathon-list',
  templateUrl: './hackathon-list.component.html',
  styleUrls: ['./hackathon-list.component.scss']
})
export class HackathonListComponent {
  hackathons: Hackathon[] = [];  // Array of hackathons
  selectedHackathon: Hackathon | null = null;  // To store the selected hackathon for editing
  visibleSidebar2: boolean = false;  // Controls sidebar visibility

  constructor(private hackathonService: HackathonService) {}

  ngOnInit() {
    this.loadHackathons();
  }

  loadHackathons() {
    this.hackathonService.getHackathons().subscribe((data: Hackathon[]) => {
      this.hackathons = data;
    });
  }

  showAddHackathonForm(hackathon?: Hackathon) {
    // Deep clone the hackathon object
    this.selectedHackathon = hackathon ? JSON.parse(JSON.stringify(hackathon)) : null;
    
    console.log('Editing hackathon with ID:', this.selectedHackathon?.id);
    this.visibleSidebar2 = true;
  }

  hideSidebar() {
    this.visibleSidebar2 = false;
    this.selectedHackathon = null;  // Reset selection after closing sidebar
  }

  deleteHackathon(id: number) {
    if (confirm('Are you sure you want to delete this hackathon?')) {
      this.hackathonService.deleteHackathon(id).subscribe({
        next: () => this.loadHackathons(),
        error: (err) => console.error('Error:', err)
      });
    }
    location.reload();
  }
}
