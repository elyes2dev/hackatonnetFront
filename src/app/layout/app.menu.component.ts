import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
    styleUrls: ['./app.menu.component.scss']
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [
                    { label: 'General', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/'] },
                    { label: 'Landing', icon: 'pi pi-fw pi-home', routerLink: ['/landing'] }
                ]
            },
            {
                label: 'Admin Modules',
                items: [
                    { label: 'Sponsor Applications', icon: 'pi pi-fw pi-user-plus', routerLink: ['/sponsor-application'] },
                    { label: 'Prizes', icon: 'pi pi-fw pi-slack', routerLink: ['/prizes'] },
                    { label: 'Workshop', icon: 'pi pi-fw pi-folder', routerLink: ['/workshops'] },
                    { label: 'User', icon: 'pi pi-fw pi-user', routerLink: ['/users'] },
                    { label: 'Support-Ticket', icon: 'pi pi-fw pi-id-card', routerLink: ['/support-tickets'] },
                    { label: 'Hackathons', icon: 'pi pi-fw pi-calendar', routerLink: ['/hackathons'] }
                ]
            },
            {
                label: 'mentor admin Components',
                items: [
                    { label: 'Mentor Applications', icon: 'pi pi-fw pi-file', routerLink: ['/mentor-applications'] },
                    { label: 'List Mentors', icon: 'pi pi-fw pi-users', routerLink: ['/list-mentors'] },
                    { label: 'mentor-form', icon: 'pi pi-fw pi-user-edit', routerLink: ['/mentor/edit', 1] },
                    { label: 'Mentor Evaluations', icon: 'pi pi-fw pi-star', routerLink: ['/mentor-evaluations'] },

                ]
            }
        ];
    }
}
