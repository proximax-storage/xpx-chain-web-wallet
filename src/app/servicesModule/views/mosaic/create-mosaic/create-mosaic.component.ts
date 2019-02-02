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
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-create-mosaic',
  templateUrl: './create-mosaic.component.html',
  styleUrls: ['./create-mosaic.component.scss']
})
export class CreateMosaicComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  isOwner = false;
  parentNamespace: any = [{
    value: '1',
    label: 'Select parent namespace',
    selected: true,
    disabled: true
  }];
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
    this.getNamespaceName();
  }



  /**
   * Create form namespace
   *
   * @memberof CreateMosaicComponent
   */
  createForm() {
    this.mosaicForm = this.fb.group({
      parentNamespace: ['1', Validators.required],
      mosaicName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      // description: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      password: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      duration: [1000, [Validators.required]],
      divisibility: [0, [Validators.required]],
      transferable: [false],
      supplyMutable: [false],
      levyMutable: [false]
    });
  }


  /**
   * Get namespace
   *
   * @memberof CreateMosaicComponent
   */
  async getNamespaceName() {
    this.blockUI.start('Processing...');
    const response = [{
      value: '1',
      label: 'Select parent namespace',
      selected: true,
      disabled: true
    }];

    for (let h of this.route.snapshot.data['dataNamespace']) {
      await new Promise((resolve, reject) => {
        this.nemProvider.namespaceHttp.getNamespacesName(h.levels).pipe(first()).subscribe(
          namespaceName => {
            console.log(namespaceName);
            for (let x of namespaceName) {
              response.push({
                label: x.name,
                value: x.name,
                selected: false,
                disabled: false
              });
            }

            resolve(response);
          }, error => {
            console.error("Has ocurred a error", error);
            this.router.navigate([AppConfig.routes.home]);
            this.sharedService.showError('', error);
            reject(error);
          });
      });
    }

    this.blockUI.stop();
    this.parentNamespace = response;
  }


  send() {
    if (this.mosaicForm.valid && this.mosaicForm.get('parentNamespace').value !== '1') {
      console.log("Formulario es valido...");
      const common = {
        password: this.mosaicForm.get('password').value,
        privateKey: ''
      }

      if (this.walletService.decrypt(common)) {
        const account = this.nemProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
        console.log(account);
        const registerMosaicTransaction = this.nemProvider.buildRegisterMosaicTransaction(
          this.mosaicForm.get('mosaicName').value,
          this.mosaicForm.get('parentNamespace').value,
          this.mosaicForm.get('supplyMutable').value,
          this.mosaicForm.get('transferable').value,
          this.mosaicForm.get('levyMutable').value,
          this.mosaicForm.get('divisibility').value,
          this.mosaicForm.get('duration').value,
          this.walletService.network
        );

        const signedTransaction = account.sign(registerMosaicTransaction);
        this.nemProvider.announce(signedTransaction).subscribe(
          x => {
            console.log(x)
            this.blockUI.stop(); // Stop blocking
            this.mosaicForm.reset();
            this.mosaicForm.patchValue({ parentNamespace: '1' });
            this.mosaicForm.patchValue({ duration: 1000 });
            this.mosaicForm.patchValue({ divisibility: 0 });
            this.sharedService.showSuccess('Success', 'Create mosaic sent')
          },
          err => {
            console.error(err)
            this.blockUI.stop(); // Stop blocking
            this.mosaicForm.patchValue({ parentNamespace: '1' });
            this.sharedService.showError('', err);
          });
      }

      // this.nemProvider.sendTransaction();
    } else if (this.mosaicForm.get('parentNamespace').value === '1') {
      this.sharedService.showError('', 'Please select a parent namespace');
    } else {
      this.sharedService.showError('', 'Please validate and complete the form');
    }
  }

  /**
   *
   * @param param
   * @param formControl
   */
  getError(param: string | (string | number)[], formControl?: any) {
    if (this.mosaicForm.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.mosaicForm.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.mosaicForm.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.mosaicForm.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.mosaicForm.get(param).getError('maxlength').requiredLength} characters`;
    }
  }


  /************************* NOT USE ******************************** */



  /**
   * Get namespace
   *
   * @memberof CreateMosaicComponent
   */
  getNamespaceName2() {
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
    const v = (value == null) ? [] : value;
    const response = [{
      value: '1',
      label: 'Select parent namespace',
      selected: true,
      disabled: true
    }];
    v.forEach((item) => {
      response.push({
        value: item.name,
        label: item.name,
        selected: false,
        disabled: false
      });
    });
    return Promise.resolve(response);
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

  getError2(field) {

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
