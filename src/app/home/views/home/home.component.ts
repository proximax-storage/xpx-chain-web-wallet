import { Component, OnInit } from '@angular/core';
import { ServicesModuleService, StructureService } from '../../../servicesModule/services/services-module.service';
import { AppConfig } from '../../../config/app.config';
import * as CryptoJS from 'crypto-js';
import { SharedService } from 'src/app/shared/services/shared.service';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  link = {
    createWallet: AppConfig.routes.createWallet,
    importWallet: AppConfig.routes.importWallet,
    selectTypeCreationWallet: AppConfig.routes.selectTypeCreationWallet
  };
  objectKeys = Object.keys;
  servicesList: StructureService[] = [];


  constructor(
    private services: ServicesModuleService,
    private sharedService: SharedService,
    private walletService: WalletService,
    private router: Router
  ) { }

  ngOnInit() {
    this.servicesList = [
      this.services.buildStructureService(
        'Blockchain',
        true,
        'Multisig, aggregated tx, cross chain, metadata',
        'icon-blockchain-full-color-80h-proximax-sirius-wallet.svg',
      ),
      this.services.buildStructureService(
        'Storage',
        true,
        'P2P decentralised storage for any type of file',
        'icon-storage-full-color-80h-proximax-sirius-wallet.svg',
      ),
      this.services.buildStructureService(
        'Streaming',
        true,
        'P2P decentralised streaming for video and chat',
        'icon-streaming-full-color-80h-proximax-sirius-wallet.svg',
      ),
      this.services.buildStructureService(
        'Supercontracts',
        true,
        'Easily modifiable digital contracts',
        'icon-supercontracts-full-color-80h-proximax-sirius-wallet.svg',
      )
    ];
  }

  /**
   * Method to take the selected file
   * @param {File} files file array
   * @param {Event} $event get the html element
   */
  fileChange(files: File[], $event) {
    console.log('This is a probe ----------------->', files);

    if (files.length > 0) {
      const myReader: FileReader = new FileReader();
      myReader.onloadend = (e) => {
        const file = CryptoJS.enc.Base64.parse(myReader.result);
        try {
          const dataDecryp = JSON.parse(file.toString(CryptoJS.enc.Utf8));
          console.log('This a decryp-------->', dataDecryp);

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

            for (const element of dataDecryp.accounts) {
              if ('publicAccount' in element) {
                accounts.push(element);
              }
              // else {
              //   accounts.push({
              //     address: element,
              //     byDefault: true,
              //     encrypted: wallet.encryptedPrivateKey.encryptedKey,
              //     firstAccount: true,
              //     iv: wallet.encryptedPrivateKey.iv,
              //     network: wallet.network,
              //     nameAccount: 'Primary',
              //     publicAccount: this.proximaxProvider.getPublicAccountFromPrivateKey(this.proximaxProvider.decryptPrivateKey(
              //       password,
              //       wallet.encryptedPrivateKey.encryptedKey,
              //       wallet.encryptedPrivateKey.iv
              //     ).toUpperCase(), wallet.network),
              //     isMultisign: null,
              //     nis1Account: null
              //   });
              // }
            }

            const wallet = {
              name: walletName,
              accounts: accounts,
              book: []
            }

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

}
