import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { LoggedGuard } from '../shared/guard/logged.guard';
import { ExplorerComponent } from "./views/explorer/explorer.component";
import { AddNodeComponent } from "./views/add-node/add-node.component";
import { SelectNodeComponent } from './views/select-node/select-node.component';
import { ServicesComponent } from "./views/services/services.component";
import { AccountComponent } from './views/account/account.component';
import { AddressBookComponent } from "./views/address-book/address-book.component";
import { CreateMosaicComponent } from './views/mosaic/create-mosaic/create-mosaic.component';
import { CreateMosaicResolver } from './views/mosaic/resolvers/creat-mosaic.resolver';

const routes: Routes = [
  {
    path: `${AppConfig.routes.explorer}`,
    component: ExplorerComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.addNode}`,
    component: AddNodeComponent
  }, {
    path: `${AppConfig.routes.selectNode}`,
    component: SelectNodeComponent
  },
  /*
  {
    path: `${AppConfig.routes.createPoll}`,
    component: CreatePollComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.polls}`,
    component: PollsComponent,
    canActivate: [LoggedGuard]
  },*/
  /*
  {
    path: `${AppConfig.routes.apostille}`,
    component: CreateApostilleComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.audiApostille}`,
    component: AuditApostilleComsponent,
    canActivate: [LoggedGuard]
  },*/
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
  },
  {
    path: `${AppConfig.routes.createMosaic}`,
    component: CreateMosaicComponent,
    canActivate: [LoggedGuard]
    // resolve: { dataNamespace: CreateMosaicResolver }
  },
  /*
  {
    path: `${AppConfig.routes.storage}`,
    component: StorageComponent,
    canActivate: [LoggedGuard]
  },

  {
    path: `${AppConfig.routes.editMosaic}`,
    component: EditMosaicComponent,
    canActivate: [LoggedGuard],
    resolve: { dataNamespace: CreateNamespaceResolver }
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
  },


  {
    path: `${AppConfig.routes.createMultisignature}`,
    component: CreateMultisignatureComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.editMultisignatureContract}`,
    component: EditMultisignatureContractComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.signMultiSigTransactions}`,
    component: SignMultisigTransactionsComponent,
    canActivate: [LoggedGuard]
  }*/
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
  ]
})
export class ServicesRoutingModule { }
