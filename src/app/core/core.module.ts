import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ClipboardModule } from 'ngx-clipboard';
import { MdbModule } from "../shared/moduls/mdb/mdb.module";
import { NgSelectModule } from '@ng-select/ng-select';

import { TransferTypeComponent } from '../dashboard/components/transfer-type/transfer-type.component';
import { RegisterNamespaceTypeComponent } from '../dashboard/components/register-namespace-type/register-namespace-type.component';
import { MosaicDefinitionTypeComponent } from '../dashboard/components/mosaic-definition-type/mosaic-definition-type.component';
import { MosaicSupplyChangeTypeComponent } from '../dashboard/components/mosaic-supply-change-type/mosaic-supply-change-type.component';
import { ModifyMultisigAccountTypeComponent } from '../dashboard/components/modify-multisig-account-type/modify-multisig-account-type.component';
import { AggregateCompleteTypeComponent } from '../dashboard/components/aggregate-complete-type/aggregate-complete-type.component';
import { AggregateBondedTypeComponent } from '../dashboard/components/aggregate-bonded-type/aggregate-bonded-type.component';
import { LockTypeComponent } from '../dashboard/components/lock-type/lock-type.component';
import { SecretLockTypeComponent } from '../dashboard/components/secret-lock-type/secret-lock-type.component';
import { SecretProofComponent } from '../dashboard/components/secret-proof/secret-proof.component';
import { MosaicsInfoComponent } from '../dashboard/components/mosaics-info/mosaics-info.component';
import { MosaicAliasComponent } from '../dashboard/components/mosaic-alias/mosaic-alias.component';
import { AddressAliasTypeComponent } from '../dashboard/components/address-alias-type/address-alias-type.component';

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
  MosaicsInfoComponent,
  MosaicAliasComponent,
  AddressAliasTypeComponent
]

const modules = [
  CommonModule,
  ReactiveFormsModule,
  FormsModule,
  HttpClientModule,
  ClipboardModule,
  NgSelectModule
];
@NgModule({
  imports: [
    modules,
    MdbModule.forRoot()
  ],
  declarations: [
    components
  ],
  exports: [
    components,
    modules,
    MdbModule
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule
    };
  }
}
