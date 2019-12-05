import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../../app/config/app.config';
import { ExplorerComponent } from './views/explorer/explorer.component';
import { ServicesBoxComponent } from './views/services-box/services-box.component'
import { CreateNamespaceComponent } from './views/namespace/create-namespace/create-namespace.component';
import { ExtendDurationNamespaceComponent } from './views/namespace/extend-duration-namespace/extend-duration-namespace.component';
import { ListContactsComponent } from './views/address-book/list-contacts/list-contacts.component';
import { CreateMosaicComponent } from './views/mosaic/create-mosaic/create-mosaic.component';
import { MosaicsSupplyChangeComponent } from './views/mosaic/mosaics-supply-change/mosaics-supply-change.component';
import { AliasMosaicsToNamespaceComponent } from './views/mosaic/alias-mosaics-to-namespace/alias-mosaics-to-namespace.component';
import { UploadFileComponent } from './views/storage/upload-file/upload-file.component';
import { MyFileComponent } from './views/storage/my-file/my-file.component';
import { AddContactsComponent } from './views/address-book/add-contacts/add-contacts.component';
import { CreateApostilleComponent } from './views/apostille/create-apostille/create-apostille.component';
import { AuditApostilleComponent } from './views/apostille/audit-apostille/audit-apostille.component';
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
    path: AppConfig.routes.uploadFile,
    component: UploadFileComponent,
    data: {
      meta: {
        title: 'uploadFile.title',
        description: 'uploadFile.text',
        override: true,
      }
    }
  }, {
    path: AppConfig.routes.myFile,
    component: MyFileComponent,
    data: {
      meta: {
        title: 'myFile.title',
        description: 'myFile.text',
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
  }, {
    path: AppConfig.routes.createMosaic,
    component: CreateMosaicComponent,
    data: {
      meta: {
        title: 'createMosaic.title',
        description: 'createMosaic.text',
        override: true,
      }
    }
  }, {
    path: AppConfig.routes.MosaicSupplyChange,
    component: MosaicsSupplyChangeComponent,
    data: {
      meta: {
        title: 'mosaicsSupplyChange.title',
        description: 'mosaicsSupplyChange.text',
        override: true,
      }
    }
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
  }, {
    path: AppConfig.routes.LinkingNamespaceMosaic,
    component: AliasMosaicsToNamespaceComponent,
    data: {
      meta: {
        title: 'aliasMosaicsToNamespace.title',
        description: 'aliasMosaicsToNamespace.text',
        override: true,
      }
    }
  }, {
    path: AppConfig.routes.audiApostille,
    component: AuditApostilleComponent,
    data: {
      meta: {
        title: 'audiApostille.title',
        description: 'audiApostille.text',
        override: true,
      }
    }
  }, {
    path: AppConfig.routes.createApostille,
    component: CreateApostilleComponent,
    data: {
      meta: {
        title: 'createApostille.title',
        description: 'createApostille.text',
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
