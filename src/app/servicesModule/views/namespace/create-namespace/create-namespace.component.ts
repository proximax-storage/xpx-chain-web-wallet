import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ActivatedRoute, Router } from '@angular/router';
import { SignedTransaction, NamespaceId } from 'tsjs-xpx-catapult-sdk';
import { first } from 'rxjs/operators';

import { AppConfig } from '../../../../config/app.config';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { WalletService, SharedService } from '../../../../shared';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { NamespaceStorage } from '../../../../servicesModule/interfaces/mosaics-namespaces.interface';
import { NamespacesService } from '../../../../servicesModule/services/namespaces.service';

@Component({
  selector: 'app-create-namespace',
  templateUrl: './create-namespace.component.html',
  styleUrls: ['./create-namespace.component.scss']
})
export class CreateNamespaceComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  arrayselect: Array<object> = [
    {
      value: '1',
      label: '.(New root Namespace)',
      selected: true,
      disabled: false
    }
  ];

  block: number = null;
  endHeight: number;
  fee: string;
  feeType: string = 'XPX';
  labelNamespace: string = '';
  namespaceChangeInfo: any;
  namespaceInfo: Array<object> = [];
  namespaceForm: FormGroup;
  namespace: Array<object> = [
    {
      value: '1',
      label: '.(New root Namespace)',
      selected: true,
      disabled: false
    }
  ];
  renewNamespaceForm: FormGroup;
  status: boolean = true;
  startHeight: number;
  statusButtonNamespace: boolean = true;
  showDuration: boolean = true;
  typetransfer: number = 1;
  validateForm: boolean = false;
  viewReload: boolean = false;


  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private router: Router,
    private dataBridgeService: DataBridgeService,
    private namespaceService: NamespacesService
  ) { }


  ngOnInit() {
    this.createForm();
    this.getNameNamespace();
    this.fee = `0.0 ${this.feeType}`
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  getNameNamespace() {
    this.namespaceService.searchNamespaceFromAccountStorage$().then(
      async dataNamespace => {
        if (dataNamespace !== undefined && dataNamespace.length > 0) {
          this.blockUI.start('Loading...');
          this.viewReload = false;
          for (let data of dataNamespace) {
            if (data.NamespaceInfo.depth === 1) {
              await this.getRootNamespace(data, data.NamespaceInfo.active);
            } else {
              await this.getSubNivelNamespace(data, data.NamespaceInfo.active, data.NamespaceInfo.depth);
            }
          }

          this.blockUI.stop();
          this.arrayselect = this.namespace.sort(function (a: any, b: any) {
            return a.label === b.label ? 0 : +(a.label > b.label) || -1;
          });
        } else {
          this.viewReload = true;
        }
      }).catch(error => {
        console.log(error);
        this.blockUI.stop();
        this.router.navigate([AppConfig.routes.home]);
        this.sharedService.showError('', 'Please check your connection and try again');
      });
  }

  /**
   *
   *
   * @param {*} rootNamespace
   * @param {boolean} status
   * @returns
   * @memberof CreateNamespaceComponent
   */
  getRootNamespace(rootNamespace: any, status: boolean) {
    const sts = status ? false : true;
    this.namespace.push({
      value: `${rootNamespace.namespaceName.name}`,
      label: `${rootNamespace.namespaceName.name}`,
      selected: sts,
      disabled: false
    });

    this.namespaceInfo.push({
      name: `${rootNamespace.namespaceName.name}`,
      dataNamespace: rootNamespace
    });

    return;
  }

  /**
   *
   *
   * @param {*} subNamespace
   * @param {boolean} status
   * @param {number} depth
   * @returns
   * @memberof CreateNamespaceComponent
   */
  async getSubNivelNamespace(subNamespace: NamespaceStorage, status: boolean, depth: number) {
    const sts = status ? false : true;
    let disabled = false;
    let name = '';
    if (subNamespace.namespaceName.parentId !== undefined) {
      if (depth === 2) {
        //Assign level 2
        const level2 = subNamespace.namespaceName.name;
        //Search level 1
        const level1: NamespaceStorage = await this.namespaceService.getNamespaceFromId(
          this.proximaxProvider.getNamespaceId([subNamespace.namespaceName.parentId.id.lower, subNamespace.namespaceName.parentId.id.higher])
        );

        name = `${level1.namespaceName.name}.${level2}`;
      } else if (depth === 3) {
        disabled = true;
        //Assign el level3
        const level3 = subNamespace.namespaceName.name;
        //search level 2
        const level2: NamespaceStorage = await this.namespaceService.getNamespaceFromId(
          this.proximaxProvider.getNamespaceId([subNamespace.namespaceName.parentId.id.lower, subNamespace.namespaceName.parentId.id.higher])
        );

        //search level 1
        const level1: NamespaceStorage = await this.namespaceService.getNamespaceFromId(
          this.proximaxProvider.getNamespaceId([level2.namespaceName.parentId.id.lower, level2.namespaceName.parentId.id.higher])
        );
        name = `${level1.namespaceName.name}.${level2.namespaceName.name}.${level3}`;
      }

      this.namespace.push({
        value: name,
        label: name,
        selected: sts,
        disabled: disabled
      });

      this.namespaceInfo.push({
        name: name,
        dataNamespace: subNamespace
      });

      return;
    }

    return;
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  createForm() {
    //Form namespace default
    this.namespaceForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(64)]],
      namespaceRoot: ['1'],
      duration: [''],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });

    // Form Renew Namespace
    this.renewNamespaceForm = this.fb.group({
      name: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(64)]],
      duration: [''],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });

    // Form namespace default
    this.namespaceForm.get('namespaceRoot').valueChanges.subscribe(namespaceRoot => {
      //console.log(namespaceRoot);
      this.typetransfer = (namespaceRoot === '1') ? 1 : 2;
      this.showDuration = (namespaceRoot === '1') ? true : false;
      //console.log(this.showDuration);
    })

    this.namespaceForm.get('name').valueChanges.subscribe(name => {
      if (!this.validateNamespace(name)) return this.sharedService.showError('Error', '¡Name of namespace is invalid!!')
    })
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  createNamespace() {
    if (this.namespaceForm.valid && this.validateForm) {
      const common = {
        password: this.namespaceForm.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        const signedTransaction = this.signedTransaction(common);
        this.proximaxProvider.announce(signedTransaction).subscribe(
          () => {
            this.resetForm()
            this.blockUI.stop();
            this.sharedService.showSuccess('', 'Transaction sent')
          }, () => {
            this.resetForm()
            this.blockUI.stop();
            this.sharedService.showError('', 'An unexpected error has occurred');
          }
        );
      }
    }
  }


  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  getBlock$() {
    this.dataBridgeService.getBlock().subscribe(
      async response => {
        this.block = response
      }
    );
  }

  /**
   *
   * @param param
   * @param formControl
   */
  getError(control: string | (string | number)[], typeForm?: any, formControl?: string | number) {
    const form = (typeForm === undefined) ? this.namespaceForm : this.renewNamespaceForm;
    if (formControl === undefined) {
      if (form.get(control).getError('required')) {
        return `This field is required`;
      } else if (form.get(control).getError('minlength')) {
        return `This field must contain minimum ${form.get(control).getError('minlength').requiredLength} characters`;
      } else if (form.get(control).getError('maxlength')) {
        return `This field must contain maximum ${form.get(control).getError('maxlength').requiredLength} characters`;
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
      }
    }
  }


  /*orderNamespace(value: any, old: any = '') {
    if (value.length) {
      for (let i of value) {
        if (i.parentId == undefined && old == '') {
          this.labelNamespace = this.labelNamespace.concat(`${i.name}`)
          this.orderNamespace(value.filter(function (value) {
            return value.namespaceId.id.lower != i.namespaceId.id.lower;
          }), i)
          break
        } else if (i.parentId != undefined && old != '') {
          if (i.parentId.id.lower == old.namespaceId.id.lower) {
            this.labelNamespace = this.labelNamespace.concat(`.${i.name}`)
            this.orderNamespace(value.filter(function (value) {
              return value.namespaceId.id.lower != i.namespaceId.id.lower;
            }), i)
            break
          }
        }
      }
      return this.labelNamespace
    }
  }*/


  /**
   *
   *
   * @param {*} namespace
   * @memberof CreateNamespaceComponent
   */
  optionSelected(namespace: any) {
    namespace = (namespace === undefined) ? 1 : namespace.value;
    // console.log('------', namespace);
    this.namespaceChangeInfo = this.namespaceInfo.filter((book: any) => (book.name === namespace));
    // console.log(this.namespaceChangeInfo);
    if (this.namespaceChangeInfo.length > 0) {
      this.getBlock$();
      this.startHeight = this.namespaceChangeInfo[0].dataNamespace.NamespaceInfo.startHeight.lower;
      this.endHeight = this.namespaceChangeInfo[0].dataNamespace.NamespaceInfo.endHeight.lower;
      this.renewNamespaceForm.get('name').patchValue(this.namespaceChangeInfo[0].name);
      this.statusButtonNamespace = (this.namespaceChangeInfo[0].dataNamespace.NamespaceInfo.depth === 1) ? false : true;
    } else {
      this.statusButtonNamespace = true;
    }
  }

  /**
   *
   *
   * @param {string} namespace
   * @param {*} [isParent]
   * @returns
   * @memberof CreateNamespaceComponent
   */
  validateNamespace(namespace: string, isParent?: any) {
    // Test if correct length and if name starts with hyphens
    if (!isParent ? namespace.length > 16 : namespace.length > 64 || /^([_-])/.test(namespace)) {
      return false;
    }

    let pattern = /^[a-z0-9.\-_]*$/;
    // Test if has special chars or space excluding hyphens
    if (pattern.test(namespace) == false) {
      this.validateForm = false;
      return false;
    } else {
      this.validateForm = true;
      return true;
    }
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  resetForm() {
    this.namespaceForm.get('name').patchValue('');
    this.namespaceForm.get('duration').patchValue('');
    this.namespaceForm.get('password').patchValue('');
    this.namespaceForm.get('namespaceRoot').patchValue('1');

    this.renewNamespaceForm.get('name').patchValue('');
    this.renewNamespaceForm.get('duration').patchValue('');
    this.renewNamespaceForm.get('password').patchValue('');
    this.statusButtonNamespace = true;
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  renewNamespace() {
    this.typetransfer = 1;
    this.namespaceForm.get('name').patchValue('');
    this.namespaceForm.get('password').patchValue('');
    if (this.renewNamespaceForm.valid) {
      const common = {
        password: this.renewNamespaceForm.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        const signedTransaction = this.signedTransaction(common);
        this.proximaxProvider.announce(signedTransaction).subscribe(
          () => {
            this.resetForm();
            this.blockUI.stop();
            this.sharedService.showSuccess('', 'Transaction sent');
          }, () => {
            this.resetForm();
            this.blockUI.stop();
            this.sharedService.showError('', 'An unexpected error has occurred');
          }
        );
      }
    }
  }

  /**
   *
   *
   * @param {*} common
   * @returns {Promise<any>}
   * @memberof CreateNamespaceComponent
   */
  signedTransaction(common: any): SignedTransaction {
    const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
    const namespaceName: string = this.namespaceForm.get('name').value || this.renewNamespaceForm.get('name').value
    const duration: number = this.namespaceForm.get('duration').value || this.renewNamespaceForm.get('duration').value
    if (this.typetransfer == 1) {
      const registerRootNamespaceTransaction = this.proximaxProvider.registerRootNamespaceTransaction(namespaceName, this.walletService.network, duration)
      const signedTransaction = account.sign(registerRootNamespaceTransaction);
      return signedTransaction;
    } else if (this.typetransfer == 2) {
      const rootNamespaceName = this.namespaceForm.get('namespaceRoot').value;
      const subnamespaceName = this.namespaceForm.get('name').value;
      const registersubamespaceTransaction = this.proximaxProvider.registersubNamespaceTransaction(rootNamespaceName, subnamespaceName, this.walletService.network)
      const signedTransaction = account.sign(registersubamespaceTransaction);
      return signedTransaction;
    }
  }
}
