import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
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
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService,
    private sharedService: SharedService
  ) {


  }

  ngOnInit() {
    this.createForm();
    //this.getNamespaceName();
  }



  /**
   * Create form namespace
   *
   * @memberof CreateMosaicComponent
   */
  createForm() {
    this.mosaicForm = this.fb.group({
      // parentNamespace: ['1', Validators.required],
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
        this.proximaxProvider.namespaceHttp.getNamespacesName(h.levels).pipe(first()).subscribe(
          namespaceName => {
            // console.log(namespaceName);
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
            // console.error("Has ocurred a error", error);
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
    const common = {
      password: this.mosaicForm.get('password').value,
      privateKey: ''
    }
    if (this.walletService.decrypt(common)) {
      const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
      const nonce = this.proximaxProvider.createNonceRandom();

      //BUILD TRANSACTION
      const mosaicDefinitionTransaction = this.proximaxProvider.buildMosaicDefinition(
        nonce,
        account,
        this.mosaicForm.get('supplyMutable').value,
        this.mosaicForm.get('transferable').value,
        this.mosaicForm.get('levyMutable').value,
        this.mosaicForm.get('divisibility').value,
        this.mosaicForm.get('duration').value,
        this.walletService.network
      );

      // I SIGN THE TRANSACTION
      const signedTransaction = account.sign(mosaicDefinitionTransaction);
      //ANNOUNCEMENT THE TRANSACTION-
      this.proximaxProvider.announce(signedTransaction).subscribe(
        async x => {
          // console.log(x);
          this.mosaicForm.reset();
          // this.mosaicForm.patchValue({ parentNamespace: '1' });
          this.mosaicForm.patchValue({ duration: 1000 });
          this.mosaicForm.patchValue({ divisibility: 0 });
          this.sharedService.showSuccess('', 'Transaction sent')
          const response = await this.proximaxProvider.getTransactionStatusError(signedTransaction.hash).toPromise();
          // console.log(response);
        },
        error => {
          // console.log(error);
        }
      );
    }

    /*  if (this.mosaicForm.valid && this.mosaicForm.get('parentNamespace').value !== '1') {
        // console.log("Formulario es valido...");
        const common = {
          password: this.mosaicForm.get('password').value,
          privateKey: ''
        }

        if (this.walletService.decrypt(common)) {
          const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
          // console.log(account);
          const registerMosaicTransaction = this.proximaxProvider.buildRegisterMosaicTransaction(
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
          this.proximaxProvider.announce(signedTransaction).subscribe(
            x => {
              // console.log(x)
              this.blockUI.stop(); // Stop blocking
              this.mosaicForm.reset();
              this.mosaicForm.patchValue({ parentNamespace: '1' });
              this.mosaicForm.patchValue({ duration: 1000 });
              this.mosaicForm.patchValue({ divisibility: 0 });
              this.sharedService.showSuccess('Success', 'Create mosaic sent')
            },
            err => {
              // console.error(err)
              this.blockUI.stop(); // Stop blocking
              this.mosaicForm.patchValue({ parentNamespace: '1' });
              this.sharedService.showError('', err);
            });
        }

        // this.proximaxProvider.sendTransaction();
      } else if (this.mosaicForm.get('parentNamespace').value === '1') {
        this.sharedService.showError('', 'Please select a parent namespace');
      } else {
        this.sharedService.showError('', 'Please validate and complete the form');
      }*/
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
}
