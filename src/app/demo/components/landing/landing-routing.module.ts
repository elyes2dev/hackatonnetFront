
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing.component';
import { LoginComponent } from './auth/login/login.component';
import { TeamCreateComponent } from './team-frontoffice/team/team-create/team-create.component';
import { TeamJoinComponent } from './team-frontoffice/team/team-join/team-join.component';
import { TeamConversationComponent } from './team-frontoffice/team/team-conversation/team-conversation.component';

const routes: Routes = [
    { path: 'team/frontoffice', loadChildren: () => import('./team-frontoffice/team-frontoffice.module').then(m => m.TeamFrontofficeModule) },
    { path: 'landing/team/frontoffice/team/create', component: TeamCreateComponent },
  { path: 'landing/team/frontoffice/team/join', component: TeamJoinComponent },
  { path: 'landing/team/frontoffice/conversation/:teamId', component: TeamConversationComponent },
    { path: '', component: LandingComponent }
];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class LandingRoutingModule { }
