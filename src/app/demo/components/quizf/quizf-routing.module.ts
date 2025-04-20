import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuizfScoreAddComponent } from './quizf-score-add/quizf-score-add.component';
import { QuizfDetailsComponent } from './quizf-details/quizf-details.component';
import { QuizfFormComponent } from './quizf-form/quizf-form.component';
import { QuizfListComponent } from './quizf-list/quizf-list.component';

const routes: Routes = [
    {
        path: '',
        component: QuizfListComponent
    },
    {
        path: 'new',
        component: QuizfFormComponent
    },
    {
        path: ':quizId/edit',
        component: QuizfFormComponent
    },
    {
        path: ':quizId/details',
        component: QuizfDetailsComponent
    },
    {
        path: ':quizId/score-add',
        component: QuizfScoreAddComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class QuizfRoutingModule { } 