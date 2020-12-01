import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { MultiSignRoutingModule } from './multi-sign-routing.module';
import { CreateMultiSignatureComponent } from './components/create-multi-signature/create-multi-signature.component';
import { EditAccountMultisignComponent } from './views/edit-account-multisign/edit-account-multisign.component';
import { ConvertAccountMultisigComponent } from './views/convert-account-multisig/convert-account-multisig.component';
import { ContractMultisigComponent } from './views/contract-multisig/contract-multisig.component';
import { EditAccountMultisigComponent } from './views/edit-account-multisig/edit-account-multisig.component';

@NgModule({
  declarations: [
    ConvertAccountMultisigComponent,
    ContractMultisigComponent,
    CreateMultiSignatureComponent,
    EditAccountMultisignComponent,
    EditAccountMultisigComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  imports: [
    CoreModule,
    MultiSignRoutingModule
  ], exports: [
    CreateMultiSignatureComponent
  ]
})
export class MultiSignModule { }
