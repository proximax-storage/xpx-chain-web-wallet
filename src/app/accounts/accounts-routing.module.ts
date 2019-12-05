import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { DetailAccountComponent } from './views/detail-account/detail-account.component';
import { AccountCreatedComponent } from './views/account-created/account-created.component';
import { CreateAccountComponent } from './views/create-account/create-account.component';
import { AccountDeleteComponent } from './views/account-delete/account-delete/account-delete.component';
import { AccountDeleteConfirmComponent } from './views/account-delete-confirm/account-delete-confirm.component';
import { SelectionAccountTypeComponent } from './views/selection-account-creation-type/selection-account-creation-type.component';
import { AliasAddressToNamespaceComponent } from './views/alias-address-to-namespace/alias-address-to-namespace.component';
import { ViewAllAccountsComponent } from './views/view-all-accounts/view-all-accounts.component';

const routes: Routes = [
  {
    path: AppConfig.routes.account,
    component: DetailAccountComponent,
    data: {
      meta: {
        title: 'detailAccount.title',
        description: 'detailAccount.text',
        override: true,
      },
    }
  }, {
    path: `${AppConfig.routes.account}/:name`,
    component: DetailAccountComponent,
    data: {
      meta: {
        title: 'detailAccount.title',
        description: 'detailAccount.text',
        override: true,
      },
    }
  }, {
    path: AppConfig.routes.accountCreated,
    component: AccountCreatedComponent,
    data: {
      meta: {
        title: 'accountCreated.title',
        description: 'accountCreated.text',
        override: true,
      },
    }
  }, {
    path: `${AppConfig.routes.createAccount}/:id`,
    component: CreateAccountComponent,
    data: {
      meta: {
        title: 'createAccount.title',
        description: 'createAccount.text',
        override: true,
      },
    }
  }, {
    path: `${AppConfig.routes.deleteAccount}/:name`,
    component: AccountDeleteComponent,
    data: {
      meta: {
        title: 'deleteAccount.title',
        description: 'deleteAccount.text',
        override: true,
      },
    }
  }, {
    path: `${AppConfig.routes.deleteAccountConfirm}/:name`,
    component: AccountDeleteConfirmComponent,
    data: {
      meta: {
        title: 'deleteAccountconfirm.title',
        description: 'deleteAccountconfirm.text',
        override: true,
      },
    }
  },

  {
    path: `${AppConfig.routes.importAccount}/:id`,
    component: CreateAccountComponent,
    data: {
      meta: {
        title: 'importAccount.title',
        description: 'importAccount.text',
        override: true,
      },
    }
  }, {
    path: AppConfig.routes.selectTypeCreationAccount,
    component: SelectionAccountTypeComponent,
    data: {
      meta: {
        title: 'selectTypeCreationAccount.title',
        description: 'selectTypeCreationAccount.text',
        override: true,
      },
    }
  }, {
    path: AppConfig.routes.aliasAddressToNamespace,
    component: AliasAddressToNamespaceComponent,
    data: {
      meta: {
        title: 'aliasAddressToNamespace.title',
        description: 'aliasAddressToNamespace.text',
        override: true,
      }
    }
  }, {
    path: AppConfig.routes.viewAllAccount,
    component: ViewAllAccountsComponent,
    data: {
      meta: {
        title: 'viewAllAccount.title',
        description: 'viewAllAccount.text',
        override: true,
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }
