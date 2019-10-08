import { AppConfig } from '../../../config/app.config';
import { Component, OnInit, ViewChild } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../../environments/environment';
import { ModalDirective } from 'ng-uikit-pro-standard';
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
  walletDecryp: any

  @ViewChild('basicModal', { static: true }) basicModal: ModalDirective;

  constructor(
    private router: Router,
    private serviceModuleService: ServicesModuleService,
    private sharedService: SharedService,
    private walletService: WalletService
  ) { }

  ngOnInit() {
  }

  fileChange(files: File[], $event) {
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

            console.log('this a wallet created----->', wallet);
            console.log('this a wallet contacs----->', contacs);

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
