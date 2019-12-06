import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { MultiSignRoutingModule } from './multi-sign-routing.module';
import { MultiSignatureContractComponent } from './views/multi-signature-contract/multi-signature-contract.component';
import { CreateMultiSignatureComponent } from './components/create-multi-signature/create-multi-signature.component';
import { ConvertAccountMultisignComponent } from './views/convert-account-multisign/convert-account-multisign.component';
import { EditAccountMultisignComponent } from './views/edit-account-multisign/edit-account-multisign.component';

@NgModule({
  declarations: [
    MultiSignatureContractComponent,
    CreateMultiSignatureComponent,
    ConvertAccountMultisignComponent,
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
