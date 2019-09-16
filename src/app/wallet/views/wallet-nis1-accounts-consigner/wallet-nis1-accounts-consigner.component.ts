import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { NemServiceService } from 'src/app/shared/services/nem-service.service';
import { TransactionsService } from 'src/app/transactions/services/transactions.service';
import { Router } from '@angular/router';
import { AppConfig } from 'src/app/config/app.config';
import { first, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-wallet-nis1-accounts-consigner',
  templateUrl: './wallet-nis1-accounts-consigner.component.html',
  styleUrls: ['./wallet-nis1-accounts-consigner.component.css']
})
export class WalletNis1AccountsConsignerComponent implements OnInit {

  listConsignerAccounts: any = null;
  mainAccount: any;

  constructor(
    private walletService: WalletService,
    private sharedService: SharedService,
    private nemProvider: NemServiceService,
    private transactionService: TransactionsService,
    private router: Router
  ) {
    this.mainAccount = this.walletService.getAccountInfoNis1();
    console.log('Esta es la info de la this.mainAccount ------------>', this.mainAccount);

    this.mainAccount.balance = null;
    this.mainAccount.mosaic = null;
    // this.mainAccount.nameAccount = this.mainAccount.nameAccount;

    this.searchBalance(this.mainAccount);

    this.listConsignerAccounts = this.mainAccount.consignerAccounts;

    this.listConsignerAccounts.forEach((element, index) => {
      element.publicAccount.balance = null;
      element.publicAccount.mosaic = null;
      element.publicAccount.nameAccount = this.mainAccount.nameAccount;
      this.searchBalance(element.publicAccount, index);
    });
    console.log('Esta es la info de la this.mainAccount ------------>', this.mainAccount);
    console.log('Esta es la info de la this.listConsignerAccounts ------------>', this.listConsignerAccounts);
  }

  ngOnInit() {
  }

  searchBalance(account, index = null) {
    this.nemProvider.getOwnedMosaics(account.address).pipe(first()).pipe(timeout(15000)).subscribe(
      next => {
        console.log('response search ----->', next);
        let foundXpx: boolean = false;
        for (const el of next) {
          if (el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx') {
            foundXpx = true;
            let realQuantity = null;
            realQuantity = this.transactionService.addZeros(el.properties.divisibility, el.quantity);
            realQuantity = this.nemProvider.amountFormatter(realQuantity, el, el.properties.divisibility);
            if (index === null) {
              this.mainAccount.mosaic = el;
              this.mainAccount.balance = realQuantity;
              this.mainAccount.multiSign = false;
            } else {
              this.listConsignerAccounts[index].publicAccount.mosaic = el;
              this.listConsignerAccounts[index].publicAccount.balance = realQuantity;
              this.listConsignerAccounts[index].publicAccount.multiSign = true;
            }
          }
        }
        if (!foundXpx) {
          if (index === null) {
            this.mainAccount.balance = '0.000000';
          } else {
            this.listConsignerAccounts[index].publicAccount.balance = '0.000000';
          }
        }
      },
      error => {
        this.sharedService.showWarning('', error);
        console.log('this errorr -------->', error);

        if (index === null) {
          this.mainAccount.balance = '0.000000';
          this.mainAccount.mosaic = null;
          this.mainAccount.multiSign = false;
        } else {
          this.listConsignerAccounts[index].publicAccount.balance = '0.000000';
          this.listConsignerAccounts[index].publicAccount.mosaic = null;
          this.listConsignerAccounts[index].publicAccount.multiSign = false;
        }
      }
    );
  }

  mainAccountSelected() {
    if (this.mainAccount.balance === null || this.mainAccount.balance === '0.000000') {
      return this.sharedService.showWarning('', 'The selected account has no balance');
    }
    this.walletService.setNis1AccountSelected(this.mainAccount);
    // this.walletService.setAccountMosaicsNis1(this.mainAccount.mosaic);
    this.router.navigate([`/${AppConfig.routes.transferXpx}`]);
  }

  accountSelected(account: any) {
    if (account.balance === null || account.balance === '0.000000') {
      return this.sharedService.showWarning('', 'The selected account has no balance');
    }
    console.log('Account Selected --------------->', account);

    // this.walletService.setAccountMosaicsNis1(account.mosaic);
    this.walletService.setNis1AccountSelected(account);
    this.router.navigate([`/${AppConfig.routes.transferXpx}`]);
  }

  goToBack() {
    this.walletService.setAccountInfoNis1(null);
    // this.walletService.setAccountMosaicsNis1(null);
    this.walletService.setNis1AccountSelected(null);
    this.router.navigate([`/${AppConfig.routes.auth}`]);
  }

}
