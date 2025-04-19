import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WorkshoplistfComponent } from './workshoplistf.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: WorkshoplistfComponent }
    ])],
    exports: [RouterModule]
})
export class WorkshoplistfRoutingModule { } 