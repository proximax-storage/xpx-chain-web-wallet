import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { LoggedGuard } from '../shared/guard/logged.guard';
import { NotLoggedGuard } from '../shared/guard/not-logged.guard';
import { ExplorerComponent } from "./views/explorer/explorer.component";
import { AddNodeComponent } from "./views/add-node/add-node.component";
import { SelectNodeComponent } from './views/select-node/select-node.component';
import { CreatePollComponent } from "../services/views/voting/create-poll/create-poll.component";

const routes: Routes = [
  {
    path: `${AppConfig.routes.explorer}`,
    component: ExplorerComponent,
    canActivate: [LoggedGuard]
  },{
    path: `${AppConfig.routes.addNode}`,
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
  },{
    path: `${AppConfig.routes.selectNode}`,
    component: SelectNodeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }
