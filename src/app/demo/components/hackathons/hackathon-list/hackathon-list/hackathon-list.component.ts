import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Hackathon } from 'src/app/models/hackathon';
import { HackathonService } from 'src/app/services/hackathon/hackathon.service';

@Component({
    selector: 'app-hackathon-list',
    templateUrl: './hackathon-list.component.html',
    styleUrls: ['./hackathon-list.component.scss']
})
export class HackathonListComponent implements OnInit {
  
    
    hackathons: Hackathon[] = [];
    loading: boolean = false;

    constructor(
        private router: Router,
        private hackathonService: HackathonService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadHackathons();
    }

    viewDetails(id: number) {
        this.router.navigate(['/landing/hackathons', id]);
    }

    private loadHackathons() {
        this.loading = true;
        this.hackathonService.getHackathons().subscribe({
            next: (data) => {
                this.hackathons = data;
                this.loading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load hackathons'
                });
                this.loading = false;
            }
        });
    }
}