import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { LoggedGuard } from '../shared/guard/logged.guard';
import { NotLoggedGuard } from '../shared/guard/not-logged.guard';
import { ExplorerComponent } from "./views/explorer/explorer.component";
import { AddNodeComponent } from "./views/add-node/add-node.component";
import { SelectNodeComponent } from './views/select-node/select-node.component';
import { CreatePollComponent } from "./views/voting/create-poll/create-poll.component";
import { PollsComponent } from './views/voting/polls/polls.component';
import { CreateApostilleComponent } from './views/apostille/create-apostille/create-apostille.component';
import { AuditApostilleComsponent } from './views/apostille/audit-apostille/audit-apostille.component';


const routes: Routes = [
  {
    path: `${AppConfig.routes.explorer}`,
    component: ExplorerComponent,
    canActivate: [LoggedGuard]
  },
  /*{   
    path: `${AppConfig.routes.addNode}`,
    component: AddNodeComponent
  },{
    path: `${AppConfig.routes.selectNode}`,
    component: SelectNodeComponent
  },*/

  {
    path: `${AppConfig.routes.apostille}`,
    component: CreateApostilleComponent,
    canActivate: [LoggedGuard]
  },

  {
    path: `${AppConfig.routes.audiApostille}`,
    component: AuditApostilleComsponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.createPoll}`,
    component: CreatePollComponent,
    // canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.polls}`,
    component: PollsComponent,
    canActivate: [LoggedGuard]
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: [
   
  ]
})
export class ServicesRoutingModule { }
