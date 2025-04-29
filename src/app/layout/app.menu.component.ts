import { OnInit } from '@angular/core';
import { Component, ViewEncapsulation} from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
    styleUrls: ['./app.menu.component.scss']
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(
        public layoutService: LayoutService,
        private router: Router
    ) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [

                    { label: 'Landing', icon: 'pi pi-fw pi-home', routerLink: ['/landing'] },
                    { label: 'General', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/'] }
                   
                ]
            },
            {
                label: 'Admin Modules',
                items: [

                    {
                        label: 'Users', 
                        icon: 'pi pi-fw pi-user-plus',
                        items: [
                            { label: 'Users List', icon: 'pi pi-fw pi-user', routerLink: ['/users'] },
                            { label: 'Support-Ticket', icon: 'pi pi-fw pi-id-card', routerLink: ['/support-tickets'] },
                        ]
                    },

                    { label: 'Hackathons', icon: 'pi pi-fw pi-calendar', routerLink: ['/hackathons'] },

                    {
                        label: 'Sponsors', 
                        icon: 'pi pi-fw pi-user-plus',
                        items: [
                            { label: 'Sponsor Applications', icon: 'pi pi-fw pi-user-plus', routerLink: ['/sponsor-application'] },
                    { label: 'Prizes', icon: 'pi pi-fw pi-slack', routerLink: ['/prizes'] },
                        ]
                    },

                    {
                        label: 'Mentors', 
                        icon: 'pi pi-fw pi-user-plus',
                        items: [
                            { label: 'Mentor Applications', icon: 'pi pi-fw pi-file', routerLink: ['/mentor-applications'] },
                            { label: 'Mentors List', icon: 'pi pi-fw pi-users', routerLink: ['/list-mentors'] },
                            { label: 'Mentor Evaluations', icon: 'pi pi-fw pi-star', routerLink: ['/mentor-evaluations'] }
                        ]
                    },

                    {
                        label: 'Teams', 
                        icon: 'pi pi-fw pi-users',
                        items: [
                            { label: 'Teams List', icon: 'pi pi-fw pi-users', routerLink: ['/teams'] },
                            { label: 'Team Submissions', icon: 'pi pi-fw pi-folder-open', routerLink: ['/team-submission'] }
                        ]
                    },

                    

                   

                    { label: 'Workshop', icon: 'pi pi-fw pi-folder', routerLink: ['/workshops'] },
                    
                   
                    
                    
                   

                    
                ]
            }
        ];
    }

    isActiveRoute(route: string): boolean {
        return this.router.isActive(route, false);
    }
}