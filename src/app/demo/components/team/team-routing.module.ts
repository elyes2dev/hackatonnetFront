import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateTeamComponent } from './team/create-team/create-team.component';
import { GetAllTeamsComponent } from './team/get-all-teams/get-all-teams.component';
import { UpdateTeamComponent } from './team/update-team/update-team.component';
import { JoinTeamComponent } from './team/join-team/join-team.component';
import { LeaveTeamComponent } from './team/leave-team/leave-team.component';
import { TeamMembersComponent } from './members/team-members/team-members.component';

const routes: Routes = [
  { path: 'create', component: CreateTeamComponent },
  { path: 'update/:id', component: UpdateTeamComponent },
  { path: 'join', component: JoinTeamComponent },
  { path: 'leave', component: LeaveTeamComponent }, // New route
  { path: '', component: GetAllTeamsComponent },
  { path: 'members/:teamId', component: TeamMembersComponent }, // Already present, just confirming
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamRoutingModule {}

