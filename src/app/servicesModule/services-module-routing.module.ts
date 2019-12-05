import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../../app/config/app.config';
import { ExplorerComponent } from './views/explorer/explorer.component';
import { ServicesBoxComponent } from './views/services-box/services-box.component'
import { CreateNamespaceComponent } from './views/namespace/create-namespace/create-namespace.component';
import { ExtendDurationNamespaceComponent } from './views/namespace/extend-duration-namespace/extend-duration-namespace.component';
import { ListContactsComponent } from './views/address-book/list-contacts/list-contacts.component';
import { AddContactsComponent } from './views/address-book/add-contacts/add-contacts.component';
import { ExportWalletComponent } from './views/wallet/export-wallet/export-wallet.component';
import { BlockchainComponent } from './views/nodes/blockchain/blockchain.component';
import { DeleteWalletComponent } from './views/wallet/delete-wallet/delete-wallet.component';
import { NotificationComponent } from './views/notification/notification.component';

const routes: Routes = [
  {
    path: AppConfig.routes.service,
    component: ServicesBoxComponent,
    data: {
      meta: {
        title: 'servicesBox.title',
        description: 'servicesBox.text',
        override: true,
      },
    }
  }, {
    path: AppConfig.routes.explorer,
    component: ExplorerComponent,
    data: {
      meta: {
        title: 'explorer.title',
        description: 'explorer.text',
        override: true,
      }
    }
  }, {
    path: AppConfig.routes.createNamespace,
    component: CreateNamespaceComponent,
    data: {
      meta: {
        title: 'createNamespace.title',
        description: 'createNamespace.text',
        override: true,
      }
    }
  }, {
    path: AppConfig.routes.renewNamespace,
    component: ExtendDurationNamespaceComponent,
    data: {
      meta: {
        title: 'renewNamespace.title',
        description: 'renewNamespace.text',
        override: true,
      }
    }
  }, {
    path: AppConfig.routes.extendNamespace,
    component: ExtendDurationNamespaceComponent,
    data: {
      meta: {
        title: 'extendNamespace.title',
        description: 'extendNamespace.text',
        override: true,
      }
    }
  },
  {
    path: `${AppConfig.routes.extendNamespace}/:id`,
    component: ExtendDurationNamespaceComponent,
    data: {
      meta: {
        title: 'extendNamespace.title',
        description: 'extendNamespace.text',
        override: true,
      }
    }
  }
  , {
    path: AppConfig.routes.addressBook,
    component: ListContactsComponent,
    data: {
      meta: {
        title: 'addressBook.title',
        description: 'addressBook.text',
        override: true,
      }
    },
  }, {
    path: AppConfig.routes.addContacts,
    component: AddContactsComponent,
    data: {
      meta: {
        title: 'addContaccts.title',
        description: 'addContaccts.text',
        override: true,
      }
    },
  }, {
    path: `${AppConfig.routes.addContacts}/:name`,
    component: AddContactsComponent,
    data: {
      meta: {
        title: 'addContaccts.title',
        description: 'addContaccts.text',
        override: true,
      }
    },
  },
  {
    path: AppConfig.routes.blockchain,
    component: BlockchainComponent,
    data: {
      meta: {
        title: 'blockchain.title',
        description: 'blockchain.text',
        override: true,
      }
    }
  },
  {
    path: AppConfig.routes.notification,
    component: NotificationComponent,
    data: {
      meta: {
        title: 'notification.title',
        description: 'notification.text',
        override: true,
      }
    }
  }, {
    path: AppConfig.routes.exportWallet,
    component: ExportWalletComponent,
    data: {
      meta: {
        title: 'exportWallet.title',
        description: 'exportWallet.text',
        override: true,
      }
    }
  }, {
    path: AppConfig.routes.deleteWallet,
    component: DeleteWalletComponent,
    data: {
      meta: {
        title: 'deleteWallet.title',
        description: 'deleteWallet.text',
        override: true,
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesModuleRoutingModule { }
