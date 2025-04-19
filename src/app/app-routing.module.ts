// Current Date and Time (UTC): 2025-04-15 20:30:56
// Current User's Login: Zoghlamirim

import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from './layout/app.layout.component';
import { MydashboardComponent } from './demo/components/mydashboard/mydashboard.component';
import { TeamFrontofficeComponent } from './demo/components/team-frontoffice/team-frontoffice.component';
import { LandingComponent } from './demo/components/landing/landing.component';
import { HackathonListComponent } from './demo/components/hackathons/hackathon-list/hackathon-list/hackathon-list.component';
import { HackathonDetailsComponent } from './demo/components/hackathons/hackathon-details/hackathon-details.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '',
                component: AppLayoutComponent,
                children: [
                    { 
                        path: '', 
                        loadChildren: () => import('./demo/components/dashboard/dashboard.module').then(m => m.DashboardModule) 
                    },
                    { 
                        path: 'uikit', 
                        loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UikitModule) 
                    },
                    { 
                        path: 'utilities', 
                        loadChildren: () => import('./demo/components/utilities/utilities.module').then(m => m.UtilitiesModule) 
                    },
                    { 
                        path: 'documentation', 
                        loadChildren: () => import('./demo/components/documentation/documentation.module').then(m => m.DocumentationModule) 
                    },
                    { 
                        path: 'blocks', 
                        loadChildren: () => import('./demo/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule) 
                    },
                    { 
                        path: 'pages', 
                        loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule) 
                    },
                    { 
                        path: 'mydashboard', 
                        component: MydashboardComponent 
                    },
                    { 
                        path: 'teams', 
                        loadChildren: () => import('./demo/components/team/team.module').then(m => m.TeamModule) 
                    },
                    
                ]
            },
            {
                path: 'landing',
                component: LandingComponent,
                children: [    
                    {
                        path: 'hackathons', 
                        children: [
                            { 
                                path: '', 
                                component: HackathonListComponent 
                            },
                            { 
                                path: ':id', 
                                component: HackathonDetailsComponent 
                            }
                        ]
                    },
                    { 
                        path: 'teams', 
                        children: [
                            {
                                path: 'chat',
                                component: TeamFrontofficeComponent
                            }
                        ]
                    }
                ]
            },
            { 
                path: '**', 
                redirectTo: 'pages/notfound' 
            }
        ], { 
            scrollPositionRestoration: 'enabled', 
            anchorScrolling: 'enabled', 
            onSameUrlNavigation: 'reload' 
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }