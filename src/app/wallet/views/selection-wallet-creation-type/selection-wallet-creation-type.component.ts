import { AppConfig } from '../../../config/app.config';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../../environments/environment';
import { ModalDirective } from 'ng-uikit-pro-standard';
import { NetworkType } from 'tsjs-xpx-chain-sdk';
import nem from "nem-sdk";
import { NetworkTypes } from 'nem-library';
import { NemProviderService } from '../../../swap/services/nem-provider.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { Router } from '@angular/router';
import { ServicesModuleService, StructureService } from '../../../servicesModule/services/services-module.service';
import { SharedService } from '../../../shared/services/shared.service';
import { WalletService } from '../../../wallet/services/wallet.service';


@Component({
  selector: 'app-selection-wallet-creation-type',
  templateUrl: './selection-wallet-creation-type.component.html',
  styleUrls: ['./selection-wallet-creation-type.component.css']
})
export class SelectionWalletCreationTypeComponent implements OnInit {


  link = {
    createWallet: AppConfig.routes.createWallet,
    importWallet: AppConfig.routes.importWallet
  };
  title = 'Select Wallet Creation Type'

  password: string = '';
  passwordMain = 'password';
  walletDecryp: any

  @ViewChild('basicModal', { static: true }) basicModal: ModalDirective;
  @ViewChild('file', { static: true }) myInputVariable: ElementRef;

  constructor(
    private router: Router,
    private serviceModuleService: ServicesModuleService,
    private sharedService: SharedService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private nemProvider: NemProviderService,
  ) { }

  ngOnInit() {
  }

  changeInputType(inputType) {
    let newType = this.sharedService.changeInputType(inputType)
    this.passwordMain = newType;
  }

  createStructNis() {
    const common = nem.model.objects.create("common")(this.password);
    // Get the wallet account to decrypt
    const walletAccount = this.walletDecryp.accounts[0];
    // Decrypt account private key
    nem.crypto.helpers.passwordToPrivatekey(common, walletAccount, walletAccount.algo);
    // The common object now has a private key
    // console.log(common)

    let proximaxNetwork = environment.typeNetwork.value;
    let nemNetwork = (proximaxNetwork === NetworkType.MAIN_NET) ? this.nemProvider.getNetworkType('MAIN_NET') : this.nemProvider.getNetworkType('TEST_NET');
    // console.log(common, proximaxNetwork, nemNetwork);
    if (this.walletDecryp.accounts[0].network === nemNetwork) {
      if (common.privateKey !== '') {
        let walletName = this.walletDecryp.name;
        walletName = (walletName.includes(' ') === true) ? walletName.split(' ').join('_') : walletName;
        const nameWallet = walletName;
        const network = proximaxNetwork;
        // const network = (this.walletDecryp.accounts[0].network === NetworkTypes.MAIN_NET) ? NetworkType.MAIN_NET : NetworkType.TEST_NET;
        // console.log(this.walletDecryp.accounts[0].network, NetworkType.MAIN_NET, NetworkType.TEST_NET)
        const password = this.proximaxProvider.createPassword(this.password);
        const algo = this.walletDecryp.accounts[0].algo;
        const accounts = [];
        const contacts = [];
        for (let index = 0; index < Object.keys(this.walletDecryp.accounts).length; index++) {
          const walletAccount = this.walletDecryp.accounts[index];
          nem.crypto.helpers.passwordToPrivatekey(common, walletAccount, algo);
          const privateKey = common.privateKey;
          const wallet = this.proximaxProvider.createAccountFromPrivateKey(nameWallet, password, privateKey, network);
          const nis1Wallet = this.nemProvider.createAccountPrivateKey(privateKey);
          const nisPublicAccount = {
            address: nis1Wallet.address,
            publicKey: nis1Wallet.publicKey
          };
          accounts.push({
            address: wallet.address.plain(),
            algo: "pass:bip32",
            brain: true,
            default: (index === 0),
            encrypted: wallet.encryptedPrivateKey.encryptedKey,
            firstAccount: (index === 0),
            iv: wallet.encryptedPrivateKey.iv,
            name: this.walletDecryp.accounts[index].label,
            network: network,
            publicAccount: this.proximaxProvider.getPublicAccountFromPrivateKey(this.proximaxProvider.decryptPrivateKey(
              password,
              wallet.encryptedPrivateKey.encryptedKey,
              wallet.encryptedPrivateKey.iv
            ).toUpperCase(), wallet.network),
            isMultisign: null,
            nis1Account: nisPublicAccount
          });
          contacts.push({ label: this.walletDecryp.accounts[index].label, value: wallet.address.plain(), walletContact: true });
        }
        this.serviceModuleService.setBookAddress(contacts, nameWallet);
        const walletStorage = {
          name: nameWallet,
          accounts: accounts,
          book: []
        }

        // console.log('this a wallet created----->', walletStorage);

        let walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
        walletsStorage.push(walletStorage);
        localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify(walletsStorage));

        this.sharedService.showSuccess('', 'Wallet Imported Correctly');
        this.router.navigate([`/${AppConfig.routes.auth}`]);
      } else {
        this.sharedService.showError('', 'Password Invalid');
      }
    } else {
      this.sharedService.showError('', 'Invalid network type');
    }
  }

  fileChange(files: File[], $event) {
    if (files.length > 0) {
      const myReader: FileReader = new FileReader();
      myReader.onloadend = (e) => {
        const file = CryptoJS.enc.Base64.parse(myReader.result);
        try {
          const dataDecryp = JSON.parse(file.toString(CryptoJS.enc.Utf8));
          const existWallet = this.walletService.getWalletStorage().find(
            (element: any) => {
              let walletName = dataDecryp.name;
              walletName = (walletName.includes(' ') === true) ? walletName.split(' ').join('_') : walletName
              return element.name === walletName;
            }
          );
          //Wallet does not exist
         // console.log(dataDecryp, existWallet, environment.typeNetwork.value);

          if (existWallet === undefined) {
            if (dataDecryp.accounts[0].network === environment.typeNetwork.value) {
              let walletName = dataDecryp.name;
              walletName = (walletName.includes(' ') === true) ? walletName.split(' ').join('_') : walletName
              const accounts = [];
              const contacs = [];
              if (dataDecryp.accounts.length !== undefined) {
                for (const element of dataDecryp.accounts) {
                  accounts.push(element);
                  // console.log('Esta es una pruebaaaa------------->', element);
                  contacs.push({ label: element.name, value: element.address.split('-').join(''), walletContact: true });
                }
                this.serviceModuleService.setBookAddress(contacs, walletName);
              } else {
                this.walletDecryp = dataDecryp;
                this.password = '';
                this.basicModal.show();
                return;
              }

              const wallet = {
                name: walletName,
                accounts: accounts
              }

              let walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
              walletsStorage.push(wallet);
              localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify(walletsStorage));
              this.sharedService.showSuccess('', 'Wallet Imported Correctly');
              this.router.navigate([`/${AppConfig.routes.auth}`]);
            } else {
              this.sharedService.showError('', 'Invalid network type');
            }
          } else {
            this.sharedService.showWarning('', 'The Wallet Already Exists');
          }
        } catch (error) {
        //  console.log(error);
          this.sharedService.showError('', 'Invalid Document Format');
        }
      };

      myReader.readAsText(files[0]);
    }
  }
}
