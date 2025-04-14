import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiscussionListComponent } from './discussion/discussion-list/discussion-list.component';
import { DiscussionCreateComponent } from './discussion/discussion-create/discussion-create.component';
import { DiscussionUpdateComponent } from './discussion/discussion-update/discussion-update.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { MemberCreateComponent } from './members/member-create/member-create.component';
import { MemberUpdateComponent } from './members/member-update/member-update.component';
import { HackathonListComponent } from './team/hackathon-list/hackathon-list.component';
import { TeamConversationComponent } from './team/team-conversation/team-conversation.component';
import { TeamCreateComponent } from './team/team-create/team-create.component';
import { TeamUpdateComponent } from './team/team-update/team-update.component';
import { TeamJoinComponent } from './team/team-join/team-join.component';

const routes: Routes = [
  { path: 'discussions', component: DiscussionListComponent },
  { path: 'discussion/create', component: DiscussionCreateComponent },
  { path: 'discussion/edit/:id', component: DiscussionUpdateComponent },
  { path: 'members', component: MemberListComponent },
  { path: 'member/create', component: MemberCreateComponent },
  { path: 'member/edit/:id', component: MemberUpdateComponent },
  { path: 'hackathons', component: HackathonListComponent },
  { path: 'conversation/:teamId', component: TeamConversationComponent },
  { path: 'team/create', component: TeamCreateComponent },
  { path: 'team/edit/:id', component: TeamUpdateComponent },
  { path: 'team/join', component: TeamJoinComponent },
  { path: '', redirectTo: 'hackathons', pathMatch: 'full' },];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamFrontofficeRoutingModule { }