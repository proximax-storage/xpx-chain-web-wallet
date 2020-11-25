import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { MultiSignRoutingModule } from './multi-sign-routing.module';
// import { MultiSignatureContractComponent } from './views/multi-signature-contract/multi-signature-contract.component';
import { CreateMultiSignatureComponent } from './components/create-multi-signature/create-multi-signature.component';
// import { ConvertAccountMultisignComponent } from './views/convert-account-multisign/convert-account-multisign.component';
import { EditAccountMultisignComponent } from './views/edit-account-multisign/edit-account-multisign.component';
import { ConvertAccountMultisigComponent } from './views/convert-account-multisig/convert-account-multisig.component';
import { ContractMultisigComponent } from './views/contract-multisig/contract-multisig.component';

@NgModule({
  declarations: [
    ConvertAccountMultisigComponent,
    // MultiSignatureContractComponent,
    ContractMultisigComponent,
    CreateMultiSignatureComponent,
    // ConvertAccountMultisignComponent,
    EditAccountMultisignComponent,
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
