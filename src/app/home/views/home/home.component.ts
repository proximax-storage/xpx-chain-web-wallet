import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import nem from "nem-sdk";
import { Router } from '@angular/router';
import { NetworkTypes } from 'nem-library';
import { NetworkType } from 'tsjs-xpx-chain-sdk';
import { ModalDirective } from 'ng-uikit-pro-standard';
import * as CryptoJS from 'crypto-js';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ServicesModuleService, StructureService } from '../../../servicesModule/services/services-module.service';
import { AppConfig } from '../../../config/app.config';
import { SharedService } from '../../../shared/services/shared.service';
import { WalletService } from '../../../wallet/services/wallet.service';
import { environment } from '../../../../environments/environment';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { AuthService } from '../../../auth/services/auth.service';
import { NemProviderService } from '../../../swap/services/nem-provider.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild('basicModal', { static: true }) basicModal: ModalDirective;
  @ViewChild('file', { static: true }) myInputVariable: ElementRef;
  @ViewChild('modalAuth', { static: true }) modalAuth: ModalDirective;

  eventNumber: number = 0;
  objectKeys = Object.keys;
  link = {
    createWallet: AppConfig.routes.createWallet,
    importWallet: AppConfig.routes.importWallet,
    selectTypeCreationWallet: AppConfig.routes.selectTypeCreationWallet
  };
  servicesList: StructureService[] = [];
  boxCreateWallet: StructureService[] = [];
  password: string = '';
  subscription: Subscription[] = [];
  walletDecryp: any;

  constructor(
    private authService: AuthService,
    private services: ServicesModuleService,
    private sharedService: SharedService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private router: Router,
    private nemProvider: NemProviderService,
    private serviceModuleService: ServicesModuleService
  ) { }

  ngOnInit() {
    this.walletService.accountWalletCreated = null;
    this.receiveEventShowModal();
    this.servicesList = [
      this.services.buildStructureService(
        'Blockchain',
        true,
        'Multisig, aggregated tx, cross chain, metadata.',
        'icon-blockchain-full-color-80h-proximax-sirius-wallet.svg',
      ),
      this.services.buildStructureService(
        'Storage',
        true,
        'P2P decentralised storage for any type of file.',
        'icon-storage-full-color-80h-proximax-sirius-wallet.svg',
      ),
      this.services.buildStructureService(
        'Streaming',
        true,
        'P2P decentralised streaming for video and chat.',
        'icon-streaming-full-color-80h-proximax-sirius-wallet.svg',
      ),
      this.services.buildStructureService(
        'Supercontracts',
        true,
        'Easily modifiable digital contracts.',
        'icon-supercontracts-full-color-80h-proximax-sirius-wallet.svg',
      )
    ];

    this.boxCreateWallet = [
      this.services.buildStructureService(
        'Sign In',
        true,
        '',
        'icon-add-new-blue.svg',
        `/${this.link.createWallet}`
      ), this.services.buildStructureService(
        'Create',
        true,
        '',
        'icon-wallet-import-blue.svg',
        `/${this.link.selectTypeCreationWallet}`
      )
    ]
  }

  /**
   *
   *
   * @memberof HomeComponent
   */
  createStructNis() {
    const common = nem.model.objects.create("common")(this.password);
    // Get the wallet account to decrypt
    const walletAccount = this.walletDecryp.accounts[0];
    // Decrypt account private key
    nem.crypto.helpers.passwordToPrivatekey(common, walletAccount, walletAccount.algo);
    // The common object now has a private key
    // console.log(common)

    if (common.privateKey !== '') {
      let walletName = this.walletDecryp.name;
      walletName = (walletName.includes(' ') === true) ? walletName.split(' ').join('_') : walletName;
      const nameWallet = walletName;
      const network = (this.walletDecryp.accounts[0].network === NetworkTypes.MAIN_NET) ? NetworkType.MAIN_NET : NetworkType.TEST_NET;
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

      this.sharedService.showSuccess('', 'Wallet imported correctly');
      this.router.navigate([`/${AppConfig.routes.auth}`]);
    } else {
      this.sharedService.showError('', 'Password Invalid');
    }
  }

  /**
   *
   *
   * @memberof HomeComponent
   */
  clearForm() {
    this.myInputVariable.nativeElement.value = "";
    this.password = '';
    this.walletDecryp = null
  }

  /**
   *
   *
   * @memberof HomeComponent
   */
  eventShowModal(){
    this.authService.getEventShowModal().pipe(first()).subscribe(
      next => this.authService.eventShowModalSubject.next(next+1)
    );
  }

  /**
   * Method to take the selected file
   * @param {File} files file array
   * @param {Event} $event get the html element
   */
  fileChange(files: File[], $event: Event) {
    if (files.length > 0) {
      const myReader: FileReader = new FileReader();
      myReader.onloadend = (e) => {
        const file = CryptoJS.enc.Base64.parse(myReader.result);
        try {
          const dataDecryp = JSON.parse(file.toString(CryptoJS.enc.Utf8));
          // console.log('This a decryp-------->', dataDecryp);

          const existWallet = this.walletService.getWalletStorage().find(
            (element: any) => {
              let walletName = dataDecryp.name;
              walletName = (walletName.includes('_') === true) ? walletName.split('_').join(' ') : walletName
              return element.name === walletName;
            }
          );
          //Wallet does not exist
          if (existWallet === undefined) {
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

            // console.log('this a wallet created----->', wallet);
            // console.log('this a wallet contacs----->', contacs);

            let walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
            walletsStorage.push(wallet);

            localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify(walletsStorage));
            this.sharedService.showSuccess('', 'Wallet imported correctly');
            this.router.navigate([`/${AppConfig.routes.auth}`]);
          } else {
            this.sharedService.showWarning('', 'The wallet already exists');
          }
        } catch (error) {
          this.sharedService.showError('', 'Invalid document format');
        }
      };

      myReader.readAsText(files[0]);
    }
  }

  /**
   *
   *
   * @memberof HomeComponent
   */
  receiveEventShowModal() {
    this.subscription.push(this.authService.getEventShowModal().subscribe(
      next => {
        if (next !== 0) {
          this.showModal();
        }
      }
    ));
  }


  /**
   *
   *
   * @memberof SidebarAuthComponent
   */
  showModal() {
    this.eventNumber = this.eventNumber + 1;
    this.modalAuth.show();
  }
}
