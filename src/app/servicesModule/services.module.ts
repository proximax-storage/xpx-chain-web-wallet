import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { ServicesRoutingModule } from './services-routing.module';
import { ExplorerComponent } from './views/explorer/explorer.component';
import { AddNodeComponent } from './views/add-node/add-node.component';
import { SelectNodeComponent } from './views/select-node/select-node.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    ServicesRoutingModule
  ],
  declarations: [ExplorerComponent, AddNodeComponent, SelectNodeComponent]
})
export class ServicesModule { }
