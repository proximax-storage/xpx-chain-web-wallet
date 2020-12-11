import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { ContractMultisigComponent } from './views/contract-multisig/contract-multisig.component';
import { ConvertAccountMultisigComponent } from './views/convert-account-multisig/convert-account-multisig.component';
import { EditAccountMultisigComponent } from './views/edit-account-multisig/edit-account-multisig.component';
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
    path: `${AppConfig.routes.convertToAccountMultisign}/:name`,
    component: ConvertAccountMultisigComponent,
    data: {
      meta: {
        title: 'ConvertAccountMultisigComponent.title',
        description: 'ConvertAccountMultisigComponent.text',
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
    {
    path: `${AppConfig.routes.editAccountMultisign}/:name`,
    component: EditAccountMultisigComponent,
    data: {
      meta: {
        title: 'editAccountMultisign.title',
        description: 'editAccountMultisign.text',
        override: true,
      },
    }
  }
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
  }, */
  // {
  //   path: `${AppConfig.routes.editAccountMultisign}/:name`,
  //   component: EditAccountMultisignComponent,
  //   data: {
  //     meta: {
  //       title: 'editAccountMultisign.title',
  //       description: 'editAccountMultisign.text',
  //       override: true,
  //     },
  //   }
  // }
  /*, {
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
