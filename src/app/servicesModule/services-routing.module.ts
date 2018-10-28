import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { LoggedGuard } from '../shared/guard/logged.guard';
import { NotLoggedGuard } from '../shared/guard/not-logged.guard';
import { ExplorerComponent } from "./views/explorer/explorer.component";
import { AddNodeComponent } from "./views/add-node/add-node.component";
import { SelectNodeComponent } from './views/select-node/select-node.component';
import { CreatePollComponent } from './views/voting/create-poll/create-poll.component';
const routes: Routes = [
  {
    path: `${AppConfig.routes.explorer}`,
    component: ExplorerComponent,
    canActivate: [LoggedGuard]
  },{
    path: `${AppConfig.routes.addNode}`,
<<<<<<< HEAD:src/app/services/services-routing.module.ts
    component: AddNodeComponent,
    canActivate: [LoggedGuard]
  },{
    path: `${AppConfig.routes.selectNode}`,
    component: SelectNodeComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.createPoll}`,
    component: CreatePollComponent,
    canActivate: [LoggedGuard]
=======
    component: AddNodeComponent
  },{
    path: `${AppConfig.routes.selectNode}`,
    component: SelectNodeComponent
>>>>>>> 78e5580a03f82eba510cb1150ebbcc006862b5db:src/app/servicesModule/services-routing.module.ts
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }
