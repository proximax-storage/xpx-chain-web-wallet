import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from "../../app/config/app.config";
import { ServicesBoxComponent } from "./views/services-box/services-box.component"

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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesModuleRoutingModule { }
