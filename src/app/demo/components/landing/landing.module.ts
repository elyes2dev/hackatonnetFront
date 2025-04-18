import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing.component';
import { StyleClassModule } from 'primeng/styleclass';
import { DividerModule } from 'primeng/divider';
import { ChartModule } from 'primeng/chart';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { LandingHackathonListComponent } from './Hackathon/landing-hackathon-list/landing-hackathon-list.component';
import { LandingHackathonDetailsComponent } from './Hackathon/landing-hackathon-details/landing-hackathon-details.component';
import { AvatarModule } from 'primeng/avatar';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';


@NgModule({
    imports: [
        CommonModule,
        LandingRoutingModule,
        DividerModule,
        StyleClassModule,
        ChartModule,
        PanelModule,
        ButtonModule,
        AvatarModule,
        FormsModule,
        DropdownModule,
        InputTextModule

    ],
    declarations: [LandingComponent, LandingHackathonListComponent, LandingHackathonDetailsComponent]
})
export class LandingModule { }
