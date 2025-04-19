
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing.component';
import { TeamFrontofficeComponent } from '../team-frontoffice/team-frontoffice.component';

const routes: Routes = [
    { path: '', component: LandingComponent },
    {path: 'landing', component: LandingComponent},
];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class LandingRoutingModule { }
