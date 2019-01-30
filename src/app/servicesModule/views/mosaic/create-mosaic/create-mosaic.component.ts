import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AccountInfo, QueryParams, NamespaceName } from 'proximax-nem2-sdk';
import { NemProvider } from '../../../../shared/services/nem.provider';
import { WalletService } from '../../../../shared/services/wallet.service';
import { MosaicService } from '../../../services/mosaic.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { AppConfig } from '../../../../config/app.config';

@Component({
  selector: 'app-create-mosaic',
  templateUrl: './create-mosaic.component.html',
  styleUrls: ['./create-mosaic.component.scss']
})
export class CreateMosaicComponent implements OnInit {

  isOwner = false;
  parentNamespace: any = [];
  mosaicForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private nemProvider: NemProvider,
    private walletService: WalletService,
    private mosaicService: MosaicService,
    private sharedService: SharedService
  ) {


  }

  ngOnInit() {
    this.createForm();
    this.parentNamespace = this.getNamespaceName();
    console.log('valor', this.parentNamespace)
  }

  /**
   * Get namespace
   *
   * @memberof CreateMosaicComponent
   */
  getNamespaceName() {
    for (let h of this.route.snapshot.data['dataNamespace']) {
      this.nemProvider.namespaceHttp.getNamespacesName(h.levels).pipe(first()).subscribe(
        (namespaceName: any) => {
          this.namespaceNameSelect(namespaceName).then(resp => {
            this.parentNamespace = resp
          });
        }, (error: any) => {
          console.error("Has ocurred a error", error);
          this.router.navigate([AppConfig.routes.home]);
          this.sharedService.showError('', error);
        });
    }
  }

  namespaceNameSelect(value: Array<any> = []): Promise<any> {
    value = (value == null) ? [] : value
    const retorno = [{
      value: '1',
      label: 'Select parent namespace2',
      selected: true,
      disabled: true
    }];
    value.forEach((item, index) => {
      retorno.push({ value: item.name, label: item.name , selected: false,
        disabled: false});
    });
    return Promise.resolve(retorno);
  }

  async getNamespaceNamePromise() {
    const arraySelect: any = [{
      value: '1',
      label: 'Select parent namespace2',
      selected: true,
      disabled: true
    }];

    const promise = new Promise(async (resolve, reject) => {
      for (let h of this.route.snapshot.data['dataNamespace']) {
        this.nemProvider.namespaceHttp.getNamespacesName(h.levels).pipe(first()).subscribe(
          async (namespaceName: any) => {
            for (let n of namespaceName) {
              arraySelect.push({
                value: n.name,
                label: n.name
              });
            }
          }, (error: any) => {
            console.error("Has ocurred a error", error);
            this.router.navigate([AppConfig.routes.home]);
            this.sharedService.showError('', error);
            reject(false);
          });
      }

      this.parentNamespace = arraySelect;
      console.log(arraySelect);
      resolve(true);
    });

    return await promise;
  }

  createForm() {
    this.mosaicForm = this.fb.group({
      parentNamespace: ['1', Validators.required],
      mosaicName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      description: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      password: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      initialSupply: [0, [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      divisibility: [0, [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      transferable: [false],
      supplyMutable: [false],
      levyMutable: [false]
    });
  }





  /************************* NOT USE ******************************** */

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  accountInfo() {
    const accountInfo = this.walletService.getAccountInfo();
    if (accountInfo === undefined) {
      this.nemProvider.accountHttp.getAccountInfo(this.walletService.address).subscribe(
        accountInfo => {
          console.log("AccountInfo desde cero", accountInfo);
          this.walletService.setAccountInfo(accountInfo);
        }, error => {
          console.log("Error", error);
        }
      );
    } else {
      console.log("AccountInfo en cache", accountInfo);
      this.searchMosaics(accountInfo);
    }
  }


  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  accountInfo2() {
    const accountInfo = this.walletService.getAccountInfo();
    if (accountInfo === undefined) {
      this.nemProvider.accountHttp.getAccountInfo(this.walletService.address).subscribe(
        accountInfo => {
          console.log("AccountInfo desde cero", accountInfo);
          this.walletService.setAccountInfo(accountInfo);
          this.searchMosaics(accountInfo);
        }, error => {
          console.log("Error", error);
        }
      );
    } else {
      console.log("AccountInfo en cache", accountInfo);
      this.searchMosaics(accountInfo);
    }
  }



  create() {

  }

  getError(field) {

  }

  /**
   * Seach mosaics
   *
   * @param {AccountInfo} accountInfo
   * @memberof CreateMosaicComponent
   */
  searchMosaics(accountInfo: AccountInfo) {
    const mosaicsId = [];
    const mosaicsCache = this.mosaicService.getMosaicsCache();

    // start the loop to look for the mosaics
    for (let element of accountInfo.mosaics) {
      // start the loop to look for the mosaics
      if (mosaicsCache.length > 0) {
        const mosaicsEquals = mosaicsCache.find(function (mc) {
          return mc.mosaicId.toHex() !== element.id.toHex();
        });

        if (mosaicsEquals !== undefined) {
          mosaicsId.push(element.id);
        }
      } else {
        console.log("No existe mosaicsCache...");
        mosaicsId.push(element.id);
      }
    }

    if (mosaicsId.length > 0) {
      // Search mosaics info
      this.nemProvider.mosaicHttp.getMosaics(mosaicsId).subscribe(
        mosaicsInfo => {
          for (let element of mosaicsInfo) {
            this.mosaicService.setMosaicsCache(element);
            if (element.owner.address.pretty() === this.walletService.address.pretty()) {
              console.log("Is Owner");
              this.isOwner = true;
            }
          }

          console.log("Is owner?", this.isOwner)
        });
    } else {
      console.log("Ya todos se encuentran en cache");
    }
  }

  /************************* FIN NOT USE ******************************** */

}
