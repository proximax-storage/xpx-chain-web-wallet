import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { ContractMultisigComponent } from './views/contract-multisig/contract-multisig.component';
import { ConvertAccountMultisigComponent } from './views/convert-account-multisig/convert-account-multisig.component';
// import { ConvertAccountMultisignComponent } from './views/convert-account-multisign/convert-account-multisign.component';
import { EditAccountMultisignComponent } from './views/edit-account-multisign/edit-account-multisign.component';
import { MultiSignatureContractComponent } from './views/multi-signature-contract/multi-signature-contract.component';

const routes: Routes = [
  {
    path: AppConfig.routes.MultisigMultiLevel,
    component: ContractMultisigComponent,
    data: {
      meta: {
        title: 'multisig.title',
        description: 'multisig.text',
        override: true,
      }
    }
  },
  {
    path: AppConfig.routes.convertToAccountMultisign,
    component: ConvertAccountMultisigComponent,
    data: {
      meta: {
        title: 'ConvertAccountMultisigComponent.title',
        description: 'ConvertAccountMultisigComponent.text',
        override: true,
      }
    }
  },
  /* {
    path: AppConfig.routes.convertToAccountMultisign,
    component: ConvertAccountMultisignComponent,
    data: {
      meta: {
        title: 'convertToAccountMultisign.title',
        description: 'convertToAccountMultisign.text',
        override: true,
      }
    }
  },*//* {
    path: `${AppConfig.routes.convertToAccountMultisign}/:name`,
    component: ConvertAccountMultisignComponent,
    data: {
      meta: {
        title: 'convertToAccountMultisign.title',
        description: 'convertToAccountMultisign.text',
        override: true,
      }
    }
  }, */ {
    path: `${AppConfig.routes.editAccountMultisign}/:name`,
    component: EditAccountMultisignComponent,
    data: {
      meta: {
        title: 'editAccountMultisign.title',
        description: 'editAccountMultisign.text',
        override: true,
      },
    }
  }/*, {
    path: AppConfig.routes.MultiSign,
    component: MultiSignatureContractComponent,
    data: {
      meta: {
        title: 'multiSign.title',
        description: 'multiSign.text',
        override: true,
      }
    }
  } */
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MultiSignRoutingModule { }
