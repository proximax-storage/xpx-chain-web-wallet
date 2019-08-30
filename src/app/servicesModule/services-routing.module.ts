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
import { MosaicSupplyChange } from './views/mosaic/mosaic-supply-change/mosaic-supply-change.component';
import { CreateNamespaceComponent } from './views/namespace/create-namespace/create-namespace.component';
import { LinkingNamespaceToMosaicComponent } from './views/namespace/linking-namespace-to-mosaic/linking-namespace-to-mosaic.component';
import { RenovateNamespaceComponent } from './views/namespace/renovate-namespace/renovate-namespace.component';
import { LinkTheNamespaceToAndAddressComponent } from './views/namespace/link-the-namespace-to-and-address/link-the-namespace-to-and-address.component';
import { ApostilleCreateComponent } from './views/apostille/apostille-create/apostille-create.component';
import { StorageComponent } from './views/storage/storage.component';
import { AuditApostilleComponent } from './views/apostille/audit-apostille/audit-apostille.component';

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
  },*/
  {
    path: `${AppConfig.routes.audiApostille}`,
    component: AuditApostilleComponent,
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
  },
  {
    path: `${AppConfig.routes.createMosaic}`,
    component: CreateMosaicComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.MosaicSupplyChange}`,
    component: MosaicSupplyChange,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.createNamespace}`,
    component: CreateNamespaceComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.LinkingNamespaceMosaic}`,
    component: LinkingNamespaceToMosaicComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.renovateNamespace}`,
    component: RenovateNamespaceComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.linkTheNamespaceToAnAddress}`,
    component: LinkTheNamespaceToAndAddressComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.apostille}`,
    component: ApostilleCreateComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.storage}`,
    component: StorageComponent,
    canActivate: [LoggedGuard]
  }


  /*

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
  providers: []
})
export class ServicesRoutingModule { }
