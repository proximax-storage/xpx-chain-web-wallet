import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from "../../app/config/app.config";
import { ExplorerComponent } from './views/explorer/explorer.component';
import { ServicesBoxComponent } from "./views/services-box/services-box.component"
import { DetailAccountComponent } from './views/account/detail-account/detail-account.component';
import { CreateNamespaceComponent } from './views/namespace/create-namespace/create-namespace.component';
import { ExtendDurationNamespaceComponent } from './views/namespace/extend-duration-namespace/extend-duration-namespace.component';
import { ListContactsComponent } from './views/address-book/list-contacts/list-contacts.component';
import { CreateMosaicComponent } from './views/mosaic/create-mosaic/create-mosaic.component';
import { AliasAddressToNamespaceComponent } from './views/account/alias-address-to-namespace/alias-address-to-namespace.component';
import { MosaicsSupplyChangeComponent } from './views/mosaic/mosaics-supply-change/mosaics-supply-change.component';
import { AliasMosaicsToNamespaceComponent } from './views/mosaic/alias-mosaics-to-namespace/alias-mosaics-to-namespace.component';
import { UploadFileComponent } from './views/storage/upload-file/upload-file.component';
import { MyFileComponent } from './views/storage/my-file/my-file.component';
import { MultiSignatureContractComponent } from './views/multi-sign/multi-signature-contract/multi-signature-contract.component';
import { CreateAccountComponent } from './views/account/create-account/create-account.component';
import { ViewAllAccountsComponent } from './views/account/view-all-accounts/view-all-accounts.component';
import { AccountCreatedComponent } from './views/account/account-created/account-created.component';
import { SelectionAccountTypeComponent } from './views/account/selection-account-creation-type/selection-account-creation-type.component';
import { AddContactsComponent } from './views/address-book/add-contacts/add-contacts.component';
import { ConvertAccountMultisignComponent } from './views/multi-sign/convert-account-multisign/convert-account-multisign.component';
import { EditAccountMultisignComponent } from './views/multi-sign/edit-account-multisign/edit-account-multisign.component';
import { CreatePollComponent } from './views/voting/create-poll/create-poll.component';
import { CreateApostilleComponent } from './views/apostille/create-apostille/create-apostille.component';
import { AuditApostilleComponent } from './views/apostille/audit-apostille/audit-apostille.component';
import { PollsComponent } from './views/voting/polls/polls.component';
import { VoteInPollComponent } from './views/voting/vote-in-poll/vote-in-poll.component';
import { AccountDeleteComponent } from './views/account/account-delete/account-delete/account-delete.component';
import { AccountDeleteConfirmComponent } from './views/account/account-delete-confirm/account-delete-confirm.component';
import { ExportWalletComponent } from "./views/wallet/export-wallet/export-wallet.component";
import { BlockchainComponent } from './views/nodes/blockchain/blockchain.component';
import { DeleteWalletComponent } from "./views/wallet/delete-wallet/delete-wallet.component";

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
    path: AppConfig.routes.createPoll,
    component: CreatePollComponent,
    data: {
      meta: {
        title: 'createPoll.title',
        description: 'createPoll.text',
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
  },
  {
    path: AppConfig.routes.polls,
    component: PollsComponent,
    data: {
      meta: {
        title: 'polls.title',
        description: 'polls.text',
        override: true,
      }
    }
  },
  {
    path: `${AppConfig.routes.voteInPoll}/:id`,
    component: VoteInPollComponent,
    data: {
      meta: {
        title: 'voteInPoll.title',
        description: 'voteInPoll.text',
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
    path: AppConfig.routes.MultiSign,
    component: MultiSignatureContractComponent,
    data: {
      meta: {
        title: 'multiSign.title',
        description: 'multiSign.text',
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
  },
  {
    path: AppConfig.routes.convertToAccountMultisign,
    component: ConvertAccountMultisignComponent,
    data: {
      meta: {
        title: 'convertToAccountMultisign.title',
        description: 'convertToAccountMultisign.text',
        override: true,
      }
    }
  },
  {
    path: `${AppConfig.routes.convertToAccountMultisign}/:name`,
    component: ConvertAccountMultisignComponent,
    data: {
      meta: {
        title: 'convertToAccountMultisign.title',
        description: 'convertToAccountMultisign.text',
        override: true,
      }
    }
  }, {
    path: `${AppConfig.routes.editAccountMultisign}/:name`,
    component: EditAccountMultisignComponent,
    data: {
      meta: {
        title: 'editAccountMultisign.title',
        description: 'editAccountMultisign.text',
        override: true,
      },
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
