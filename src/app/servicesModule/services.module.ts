import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { ServicesRoutingModule } from './services-routing.module';
import { ExplorerComponent } from './views/explorer/explorer.component';
import { AddNodeComponent } from './views/add-node/add-node.component';
import { SelectNodeComponent } from './views/select-node/select-node.component';
import { ServicesComponent } from "./views/services/services.component";
import { AccountComponent } from './views/account/account.component';
import { AddressBookComponent } from './views/address-book/address-book.component';
import { CreateMosaicComponent } from './views/mosaic/create-mosaic/create-mosaic.component';
import { MosaicSupplyChange } from './views/mosaic/mosaic-supply-change/mosaic-supply-change.component';
import { CreateNamespaceComponent } from './views/namespace/create-namespace/create-namespace.component';
import { LinkingNamespaceToMosaicComponent } from './views/namespace/linking-namespace-to-mosaic/linking-namespace-to-mosaic.component';



@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    ServicesRoutingModule
  ],
  declarations: [
    ExplorerComponent,
    AddNodeComponent,
    SelectNodeComponent,
    LinkingNamespaceToMosaicComponent,
    //  CreatePollComponent,
    //  PollsComponent,
    //  CreateApostilleComponent,
    //AuditApostilleComsponent,
    //  HighchartsChartComponent,
    ServicesComponent,
    AccountComponent,
    AddressBookComponent,
    CreateMosaicComponent,
    MosaicSupplyChange,
    CreateNamespaceComponent
    /* StorageComponent,
     EditMosaicComponent,
     EditNamespaceComponent,
     CreateMultisignatureComponent,
     EditMultisignatureContractComponent,
     SignMultisigTransactionsComponent,*/
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ServicesModule { }
