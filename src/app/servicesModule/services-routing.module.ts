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
import { ServicesComponent } from "./views/services/services.component";
import { AccountComponent } from './views/account/account.component';
import { AddressBookComponent } from "./views/address-book/address-book.component";
import { StorageComponent } from './views/storage/storage.component';
import { CreateMosaicComponent } from './views/mosaic/create-mosaic/create-mosaic.component';
import { EditMosaicComponent } from './views/mosaic/edit-mosaic/edit-mosaic.component';

import { CreateNamespaceComponent } from './views/namespace/create-namespace/create-namespace.component';
import { EditNamespaceComponent } from './views/namespace/edit-namespace/edit-namespace.component';


import { CreateMosaicResolver } from './views/mosaic/resolvers/creat-mosaic.resolver';
import { CreateNamespaceResolver } from './views/namespace/resolvers/creat-namespace.resolver';


const routes: Routes = [
  {
    path: `${AppConfig.routes.explorer}`,
    component: ExplorerComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.addNode}`,
    component: AddNodeComponent
  },{
    path: `${AppConfig.routes.selectNode}`,
    component: SelectNodeComponent
  },
  {
    path: `${AppConfig.routes.createPoll}`,
    component: CreatePollComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.polls}`,
    component: PollsComponent,
    canActivate: [LoggedGuard]
  },
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
    path: `${AppConfig.routes.services}`,
    component: ServicesComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.account}`,
    component: AccountComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.addressBook}`,
    component: AddressBookComponent,
    canActivate: [LoggedGuard]
  }
  ,
  {
    path: `${AppConfig.routes.storage}`,
    component: StorageComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.createMosaic}`,
    component: CreateMosaicComponent,
    canActivate: [LoggedGuard],
    resolve: { dataNamespace: CreateMosaicResolver }
  },
  {
    path: `${AppConfig.routes.editMosaic}`,
    component: EditMosaicComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.createNamespace}`,
    component: CreateNamespaceComponent,
    canActivate: [LoggedGuard],
    resolve: { dataNamespace: CreateNamespaceResolver }
  },
  {
    path: `${AppConfig.routes.editNamespace}`,
    component: EditNamespaceComponent,
    canActivate: [LoggedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    CreateMosaicResolver,
    CreateNamespaceResolver
  ]
})
export class ServicesRoutingModule { }
