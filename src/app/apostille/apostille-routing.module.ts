import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { AuditApostilleComponent } from './views/audit-apostille/audit-apostille.component';
import { CreateApostilleComponent } from './views/create-apostille/create-apostille.component';

const routes: Routes = [
  {
    path: AppConfig.routes.audiApostille,
    component: AuditApostilleComponent,
    data: {
      meta: {
        title: 'audiApostille.title',
        description: 'audiApostille.text',
        override: true,
      }
    }
  }, {
    path: AppConfig.routes.createApostille,
    component: CreateApostilleComponent,
    data: {
      meta: {
        title: 'createApostille.title',
        description: 'createApostille.text',
        override: true,
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApostilleRoutingModule { }
