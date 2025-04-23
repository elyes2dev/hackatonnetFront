import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkshopfListComponent } from './workshopf-list/workshopf-list.component';
import { WorkshopfDetailsComponent } from './workshopf-details/workshopf-details.component';

const routes: Routes = [
    {
        path: '',
        component: WorkshopfListComponent
    },
    {
        path: ':workshopId',
        component: WorkshopfDetailsComponent
    },
    {
        path: ':workshopId/quizzes',
        loadChildren: () => import('../quizf/quizf.module').then(m => m.QuizfModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WorkshopfRoutingModule { } 