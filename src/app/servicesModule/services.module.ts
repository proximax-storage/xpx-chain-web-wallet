import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { ServicesRoutingModule } from './services-routing.module';
import { ExplorerComponent } from './views/explorer/explorer.component';
import { AddNodeComponent } from './views/add-node/add-node.component';
import { SelectNodeComponent } from './views/select-node/select-node.component';
import { CreatePollComponent } from './views/voting/create-poll/create-poll.component';
import { PollsComponent } from './views/voting/polls/polls.component';
import { HighchartsChartComponent } from './highcharts-chart.component';
import { CreateApostilleComponent } from './views/apostille/create-apostille/create-apostille.component';
import { AuditApostilleComsponent } from './views/apostille/audit-apostille/audit-apostille.component';
import { ServicesComponent } from "./views/services/services.component";
import { AccountComponent } from './views/account/account.component';
import { AddressBookComponent } from './views/address-book/address-book.component';
import { StorageComponent } from './views/storage/storage.component';

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
    CreatePollComponent,
    PollsComponent,
    CreateApostilleComponent,
    AuditApostilleComsponent,
    HighchartsChartComponent,
    ServicesComponent,
    AccountComponent,
    AddressBookComponent,
    StorageComponent
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ServicesModule { }
