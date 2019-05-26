import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './views/dashboard/dashboard.component';
/*
import { TransferTypeComponent } from './components/transfer-type/transfer-type.component';
import { RegisterNamespaceTypeComponent } from './components/register-namespace-type/register-namespace-type.component';
import { MosaicDefinitionTypeComponent } from './components/mosaic-definition-type/mosaic-definition-type.component';
import { MosaicSupplyChangeTypeComponent } from './components/mosaic-supply-change-type/mosaic-supply-change-type.component';
import { ModifyMultisigAccountTypeComponent } from './components/modify-multisig-account-type/modify-multisig-account-type.component';
import { AggregateCompleteTypeComponent } from './components/aggregate-complete-type/aggregate-complete-type.component';
import { AggregateBondedTypeComponent } from './components/aggregate-bonded-type/aggregate-bonded-type.component';
import { LockTypeComponent } from './components/lock-type/lock-type.component';
import { SecretLockTypeComponent } from './components/secret-lock-type/secret-lock-type.component';
import { SecretProofComponent } from './components/secret-proof/secret-proof.component';
import { MosaicsInfoComponent } from './components/mosaics-info/mosaics-info.component';

const components = [
  TransferTypeComponent,
  RegisterNamespaceTypeComponent,
  MosaicDefinitionTypeComponent,
  MosaicSupplyChangeTypeComponent,
  ModifyMultisigAccountTypeComponent,
  AggregateCompleteTypeComponent,
  AggregateBondedTypeComponent,
  LockTypeComponent,
  SecretLockTypeComponent,
  SecretProofComponent,
  MosaicsInfoComponent
]*/

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    DashboardRoutingModule
  ],
  declarations: [
    DashboardComponent
  ],
  schemas: [NO_ERRORS_SCHEMA]

})
export class DashboardModule { }
