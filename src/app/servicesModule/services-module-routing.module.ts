import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from "../../app/config/app.config";
import { ServicesBoxComponent } from './views/services-box/services-box.component';
import { ExplorerComponent } from './views/explorer/explorer.component';

const routes: Routes = [
  {
    path: AppConfig.routes.service,
    component: ServicesBoxComponent,
    data: {
      meta: {
        title: 'servicesBox.title',
        description: 'servicesBox.text',
        override: true,
      },
    }
  },
  {
    path: AppConfig.routes.explorer,
    component: ExplorerComponent,
    data: {
      meta: {
        title: 'explorer.title',
        description: 'explorer.text',
        override: true,
      },
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesModuleRoutingModule { }
