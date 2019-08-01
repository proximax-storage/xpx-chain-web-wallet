import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NamespacesService } from '../../../services/namespaces.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { AppConfig } from '../../../../config/app.config';
import { Router } from '@angular/router';
import { TransactionsService } from 'src/app/transfer/services/transactions.service';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';

@Component({
  selector: 'app-renew-namespace',
  templateUrl: './renew-namespace.component.html',
  styleUrls: ['./renew-namespace.component.css']
})
export class RenewNamespaceComponent implements OnInit {

  moduleName = 'Namespaces & Sub-Namespaces';
  componentName = 'Renew';
  renewNamespaceForm: FormGroup;
  namespaceSelect: Array<object> = [];
  namespaceInfo: any = [{
    value: '0',
    label: 'Select root namespace',
    selected: false,
    disabled: true
  }];
  fee = '';
  feeType: string = 'XPX';
  durationByBlock = '0';


  constructor(
    private fb: FormBuilder,
    private namespaceService: NamespacesService,
    private sharedService: SharedService,
    private transactionService: TransactionsService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private router: Router
  ) { }

  ngOnInit() {
    this.fee = `0.000000 ${this.feeType}`;
    this.createForm();
    this.getNameNamespace();
    const duration = this.renewNamespaceForm.get('duration').value;
    this.durationByBlock = this.transactionService.calculateDurationforDay(duration).toString();
  }

  /**
   *
   *
   * @memberof RenewNamespaceComponent
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
   * @memberof RenewNamespaceComponent
   */
  createForm() {
    // Form Renew Namespace
    this.renewNamespaceForm = this.fb.group({
      rootNamespace: ['', [Validators.required]],
      duration: [''],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });
  }

  // /**
  //  *
  //  *
  //  * @memberof RenewNamespaceComponent
  //  */
  // renovateNamespace() {
  //   if (this.renewNamespaceForm.valid && !this.blockBtnSend) {
  //     this.blockBtnSend = true;
  //     const common = {
  //       password: this.renewNamespaceForm.get('password').value,
  //       privateKey: ''
  //     }
  //     if (this.walletService.decrypt(common)) {
  //       this.proximaxProvider.announce(this.signedTransaction(common)).subscribe(
  //         () => {
  //           this.blockBtnSend = false;
  //           this.resetForm();
  //           this.sharedService.showSuccess('', 'Transaction sent')
  //         }, () => {
  //           this.blockBtnSend = false;
  //           this.resetForm();
  //           this.sharedService.showError('', 'An unexpected error has occurred');
  //         }
  //       );
  //     } else {
  //       this.blockBtnSend = false;
  //     }
  //   }

}
