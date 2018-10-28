import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { LoggedGuard } from '../shared/guard/logged.guard';
import { NotLoggedGuard } from '../shared/guard/not-logged.guard';
import { ExplorerComponent } from "./views/explorer/explorer.component";
import { AddNodeComponent } from "./views/add-node/add-node.component";
import { SelectNodeComponent } from './views/select-node/select-node.component';
<<<<<<< HEAD
import { CreatePollComponent } from '../services/views/voting/create-poll/create-poll.component';
=======
import { CreatePollComponent } from "../services/views/voting/create-poll/create-poll.component";
>>>>>>> 64be0032a74ec89701a5793551c34005b3b7e405

const routes: Routes = [
  {
    path: `${AppConfig.routes.explorer}`,
    component: ExplorerComponent,
    canActivate: [LoggedGuard]
  },{
    path: `${AppConfig.routes.addNode}`,
<<<<<<< HEAD
    component: AddNodeComponent
=======
    component: AddNodeComponent,
    canActivate: [LoggedGuard]
>>>>>>> 64be0032a74ec89701a5793551c34005b3b7e405
  },{
    path: `${AppConfig.routes.selectNode}`,
    component: SelectNodeComponent
  },
  {
    path: `${AppConfig.routes.createPoll}`,
    component: CreatePollComponent,
<<<<<<< HEAD
    canActivate: [LoggedGuard],
=======
    canActivate: [LoggedGuard]
  },{
    path: `${AppConfig.routes.selectNode}`,
    component: SelectNodeComponent
>>>>>>> 64be0032a74ec89701a5793551c34005b3b7e405
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }
