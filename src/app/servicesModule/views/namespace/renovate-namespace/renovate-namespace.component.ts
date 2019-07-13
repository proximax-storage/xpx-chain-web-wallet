import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { SignedTransaction } from 'tsjs-xpx-chain-sdk';
import { NamespacesService } from '../../../../servicesModule/services/namespaces.service';
import { AppConfig } from '../../../../config/app.config';
import { SharedService, WalletService } from '../../../../shared';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';

@Component({
  selector: 'app-renovate-namespace',
  templateUrl: './renovate-namespace.component.html',
  styleUrls: ['./renovate-namespace.component.scss']
})
export class RenovateNamespaceComponent implements OnInit {

  renovateNamespaceForm: FormGroup;
  namespaceSelect: Array<object> = [];
  namespaceInfo: any = [{
    value: '0',
    label: 'Select root namespace',
    selected: false,
    disabled: true
  }];
  namespaceChangeInfo: any = [];
  startHeight: number = 0;
  endHeight: number = 0;
  block: number = 0;
  blockBtnSend: boolean = false;
  fee = '';
  titleInformation = 'Namespace Information';
  subscriptions = ['block'];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private namespaceService: NamespacesService,
    private dataBridgeService: DataBridgeService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider
  ) { }

  ngOnInit() {
    this.fee = `0.0 XPX`;
    this.createForm();
    this.getNameNamespace();
  }

  ngOnDestroy(): void {
    this.destroySubscription();
  }

  /**
   *
   *
   * @memberof RenovateNamespaceComponent
   */
  createForm() {
    // Form Renew Namespace
    this.renovateNamespaceForm = this.fb.group({
      rootNamespace: ['', [Validators.required]],
      duration: [''],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });
  }

  /**
   *
   *
   * @memberof RenovateNamespaceComponent
   */
  clearForm() {
    this.renovateNamespaceForm.get('rootNamespace').patchValue('');
    this.renovateNamespaceForm.get('duration').patchValue('');
    this.renovateNamespaceForm.get('password').patchValue('');
  }

  /**
   *
   *
   * @memberof RenovateNamespaceComponent
   */
  destroySubscription() {
    this.subscriptions.forEach(element => {
      if (this.subscriptions[element] !== undefined) {
        this.subscriptions[element].unsubscribe();
      }
    });
  }

  /**
   *
   *
   * @param {(string | (string | number)[])} control
   * @param {*} [typeForm]
   * @param {(string | number)} [formControl]
   * @returns
   * @memberof RenovateNamespaceComponent
   */
  getError(control: string | (string | number)[], typeForm?: any, formControl?: string | number) {
    const form = this.renovateNamespaceForm;
    if (formControl === undefined) {
      if (form.get(control).getError('required')) {
        return `This field is required`;
      } else if (form.get(control).getError('minlength')) {
        return `This field must contain minimum ${form.get(control).getError('minlength').requiredLength} characters`;
      } else if (form.get(control).getError('maxlength')) {
        return `This field must contain maximum ${form.get(control).getError('maxlength').requiredLength} characters`;
      } else {
        return `Invalid data`;
      }
    } else {
      if (form.controls[formControl].get(control).getError('required')) {
        return `This field is required`;
      } else if (form.controls[formControl].get(control).getError('minlength')) {
        return `This field must contain minimum ${form.controls[formControl].get(control).getError('minlength').requiredLength} characters`;
      } else if (form.controls[formControl].get(control).getError('maxlength')) {
        return `This field must contain maximum ${form.controls[formControl].get(control).getError('maxlength').requiredLength} characters`;
      } else if (form.controls[formControl].getError('noMatch')) {
        return `Password doesn't match`;
      } else {
        return `Invalid data`;
      }
    }
  }

  /**
   *
   *
   * @memberof RenovateNamespaceComponent
   */
  getNameNamespace() {
    this.namespaceService.searchNamespaceFromAccountStorage$().then(
      async dataNamespace => {
        if (dataNamespace !== undefined && dataNamespace.length > 0) {
          const namespaceSelect = [];
          for (let rootNamespace of dataNamespace) {
            if (rootNamespace.NamespaceInfo.depth === 1) {
              namespaceSelect.push({
                value: `${rootNamespace.namespaceName.name}`,
                label: `${rootNamespace.namespaceName.name}`,
                selected: false,
                disabled: false
              });

              this.namespaceInfo.push({
                name: `${rootNamespace.namespaceName.name}`,
                dataNamespace: rootNamespace
              });
            }
          }

          this.namespaceSelect = namespaceSelect;
        }
      }).catch(error => {
        this.router.navigate([AppConfig.routes.home]);
        this.sharedService.showError('', 'Please check your connection and try again');
      });
  }

  /**
   *
   *
   * @param {*} namespace
   * @memberof RenovateNamespaceComponent
   */
  optionSelected(namespace: any) {
    namespace = (namespace === undefined) ? 1 : namespace.value;
    this.namespaceChangeInfo = this.namespaceInfo.filter((book: any) => (book.name === namespace));
    if (this.namespaceChangeInfo.length > 0) {
      this.subscriptions['block'] = this.dataBridgeService.getBlock().subscribe(
        next => this.block = next
      );
      this.startHeight = this.namespaceChangeInfo[0].dataNamespace.NamespaceInfo.startHeight.lower;
      this.endHeight = this.namespaceChangeInfo[0].dataNamespace.NamespaceInfo.endHeight.lower;
    }
  }

  /**
   *
   *
   * @memberof RenovateNamespaceComponent
   */
  resetForm() {
    this.renovateNamespaceForm.get('rootNamespace').patchValue('1');
    this.renovateNamespaceForm.get('duration').patchValue('');
    this.renovateNamespaceForm.get('password').patchValue('');
  }

  /**
   *
   *
   * @memberof RenovateNamespaceComponent
   */
  renovateNamespace() {
    if (this.renovateNamespaceForm.valid && !this.blockBtnSend) {
      this.blockBtnSend = true;
      const common = {
        password: this.renovateNamespaceForm.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        this.proximaxProvider.announce(this.signedTransaction(common)).subscribe(
          () => {
            this.blockBtnSend = false;
            this.resetForm();
            this.sharedService.showSuccess('', 'Transaction sent')
          }, () => {
            this.blockBtnSend = false;
            this.resetForm();
            this.sharedService.showError('', 'An unexpected error has occurred');
          }
        );
      } else {
        this.blockBtnSend = false;
      }
    }
  }


  /**
   *
   *
   * @param {*} common
   * @returns {SignedTransaction}
   * @memberof RenovateNamespaceComponent
   */
  signedTransaction(common: any): SignedTransaction {
    const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
    const rootNamespaceToRenovate: string = this.renovateNamespaceForm.get('rootNamespace').value
    const duration: number = this.renovateNamespaceForm.get('duration').value
    const registerRootNamespaceTransaction = this.proximaxProvider.registerRootNamespaceTransaction(rootNamespaceToRenovate, this.walletService.network, duration)
    const signedTransaction = account.sign(registerRootNamespaceTransaction);
    return signedTransaction;
  }

}
