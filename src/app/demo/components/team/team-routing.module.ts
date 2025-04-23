import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamListComponent } from './team-list/team-list.component';
import { TeamDetailsComponent } from './team-details/team-details.component';
import { TeamFormComponent } from './team-form/team-form.component';
import { TeamChatComponent } from './team-chat/team-chat.component';

const routes: Routes = [
    {
        path: '',
        component: TeamListComponent
    },
    {
        path: 'create',
        component: TeamFormComponent
    },
    {
        path: 'join/:teamCode',
        component: TeamDetailsComponent
    },
    {
        path: ':teamId',
        component: TeamDetailsComponent
    },
    {
        path: ':teamId/chat',
        component: TeamChatComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TeamRoutingModule { }
