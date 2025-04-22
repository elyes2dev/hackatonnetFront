import { Component } from '@angular/core';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { UserService } from 'src/app/demo/services/user.service';
import { User } from 'src/app/demo/models/user.model';
import {NavbarComponent} from "../../navbar/navbar.component";

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

  user!: User;


  eventTypeOptions = [
    { label: 'Online', value: 'online' },
    { label: 'Onsite', value: 'onsite' }
  ];

  constructor(private hackathonService: HackathonService, public router: Router, public layoutService: LayoutService, private userService: UserService) {}

  ngOnInit() {
    this.loadHackathons();
    this.userService.getUserById(1).subscribe((data) => {
      this.user = data;
    });
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


  navigateToLanding() {
    this.router.navigate(['/landing']);  // Redirect to '/landings'
  }
  getBadgeIcon(): string {
    const badgeIcons: { [key: string]: string } = {
      JUNIOR_COACH: 'assets/demo/images/avatar/JUNIOR_COACH.png',
      ASSISTANT_COACH: 'assets/demo/images/avatar/ASSISTANT_COACH.png',
      SENIOR_COACH: 'assets/demo/images/avatar/SENIOR_COACH.png',
      HEAD_COACH: 'assets/demo/images/avatar/HEAD_COACH.png',
      MASTER_MENTOR: 'assets/demo/images/avatar/MASTER_MENTOR.png'
    };
    return this.user ? badgeIcons[this.user.badge] || 'assets/icons/default_badge.png' : '';
  }
}
