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
  filteredHackathons: Hackathon[] = [];
  searchTerm: string = '';
  selectedEventType: string | null = null;
  
  eventTypeOptions = [
    { label: 'Online', value: 'online' },
    { label: 'Onsite', value: 'onsite' }
  ];

  constructor(private hackathonService: HackathonService, public router: Router) {}

  ngOnInit() {
    this.loadHackathons();
  }

  loadHackathons() {
    this.hackathonService.getHackathons().subscribe((data: Hackathon[]) => {
      this.hackathons = data;
      this.filteredHackathons = [...this.hackathons];
    });
  }

  filterHackathons() {
    this.filteredHackathons = this.hackathons.filter(hackathon => {
      const matchesSearch = hackathon.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = !this.selectedEventType || 
                         (this.selectedEventType === 'online' && hackathon.isOnline) || 
                         (this.selectedEventType === 'onsite' && !hackathon.isOnline);
      
      return matchesSearch && matchesType;
    });
  }
}