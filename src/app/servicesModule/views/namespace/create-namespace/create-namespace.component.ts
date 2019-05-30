import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { WalletService, SharedService } from '../../../../shared';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AppConfig } from '../../../../config/app.config';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
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
  showDuration: boolean = false;
  typetransfer: number = 1;
  validateForm: boolean = false;


  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private router: Router,
    private dataBridgeService: DataBridgeService
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
  async getNameNamespace() {
    if (this.route.snapshot.data['dataNamespace'].value !== null) {
      this.blockUI.start('Loading...'); // Start blocking
      for (let dataNamespace of this.route.snapshot.data['dataNamespace']) {
        if (dataNamespace.depth == 1) {
          await this.getRootNamespace(dataNamespace, dataNamespace.active);
        }
        else {
          await this.getSubNivelNamespace(dataNamespace, dataNamespace.active, dataNamespace.depth);
        }
      }
    }

    this.blockUI.stop();
    this.arrayselect = this.namespace.sort(function (a: any, b: any) {
      return a.label == b.label ? 0 : +(a.label > b.label) || -1;
    })
  }

  /**
   *
   *
   * @param {*} rootNamespace
   * @param {boolean} status
   * @returns
   * @memberof CreateNamespaceComponent
   */
  async getRootNamespace(rootNamespace: any, status: boolean) {
    const promise = new Promise((resolve, reject) => {
      this.proximaxProvider.namespaceHttp.getNamespacesName(rootNamespace.levels).pipe(first()).subscribe(
        (namespaceName: any) => {
          for (let n of namespaceName) {
            const sts = status ? false : true;
            this.namespace.push({
              value: `${n.name}`,
              label: `${n.name}`,
              selected: sts,
              disabled: false
            });
            this.namespaceInfo.push({
              name: `${n.name}`,
              dataNamespace: rootNamespace
            })
          }
          resolve(true);
        }, (error: any) => {
          this.blockUI.stop();
          this.sharedService.showError('', error);
          reject(error);
        });
    });
    return await promise;
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
  async getSubNivelNamespace(subNamespace: any, status: boolean, depth: number) {
    const promise = new Promise((resolve, reject) => {
      this.proximaxProvider.namespaceHttp.getNamespacesName([subNamespace.levels[depth - 1]]).pipe(first()).subscribe(
        (namespaceName: any) => {
          this.labelNamespace = ''
          const name = this.orderNamespace(namespaceName.sort())
          this.namespace.push({
            value: name, label: name, selected: false,
            disabled: false
          });
          resolve(true);
        }, (error: any) => {
          this.blockUI.stop(); // Stop blocking
          // console.error("Has ocurred a error", error);
          this.router.navigate([AppConfig.routes.home]);
          this.sharedService.showError('', error);
          reject(error);
        });
    });
    return await promise;
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
      this.typetransfer = (namespaceRoot === 1) ? 1 : 2
      this.showDuration = (namespaceRoot === 1) ? false : true;
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
        this.signedTransactionPromise(common).then(signedTransaction => {

          this.proximaxProvider.announce(signedTransaction).subscribe(
            x => {
              this.resetForm()
              this.blockUI.stop(); // Stop blocking
              this.sharedService.showSuccess('success', 'create namespace sent')
            },
            err => {
              this.resetForm()
              this.blockUI.stop(); // Stop blocking
              // console.error(err)
              this.sharedService.showError('Error', '¡unexpected error!');
            });
        });
      }
    }
  }


  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  getBlock() {
    this.dataBridgeService.getBlock().subscribe(
      async response => {
        this.block = response
      })
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

  /**
   *
   *
   * @param {*} value
   * @param {*} [old='']
   * @returns
   * @memberof CreateNamespaceComponent
   */
  orderNamespace(value: any, old: any = '') {
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
  }


  /**
   *
   *
   * @param {*} namespace
   * @memberof CreateNamespaceComponent
   */
  optionSelected(namespace: any) {
    this.namespaceChangeInfo = this.namespaceInfo.filter((book: any) => (book.name === namespace.value))
    if (this.namespaceChangeInfo.length > 0) {
      this.getBlock()
      this.startHeight = this.namespaceChangeInfo[0].dataNamespace.startHeight.lower
      this.endHeight = this.namespaceChangeInfo[0].dataNamespace.endHeight.lower
      this.renewNamespaceForm.get('name').patchValue(this.namespaceChangeInfo[0].name)
      this.statusButtonNamespace = (this.namespaceChangeInfo[0].dataNamespace.depth == 1) ? false : true
    } else {
      this.statusButtonNamespace = true
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
    this.namespaceForm.get('name').patchValue('')
    this.namespaceForm.get('password').patchValue('')
    this.namespaceForm.get('namespaceRoot').patchValue('1')
    this.statusButtonNamespace = true
  }

  renewNamespace() {
    this.typetransfer = 1
    this.namespaceForm.get('name').patchValue('')
    this.namespaceForm.get('password').patchValue('')
    if (this.renewNamespaceForm.valid) {
      const common = {
        password: this.renewNamespaceForm.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        this.signedTransactionPromise(common).then(signedTransaction => {

          this.proximaxProvider.announce(signedTransaction).subscribe(
            x => {
              // this.basicModal.hide()
              // console.log(x)
              this.resetForm()
              this.blockUI.stop(); // Stop blocking
              this.sharedService.showSuccess('success', 'renew namespace sent')
            },
            err => {
              this.resetForm()
              this.blockUI.stop(); // Stop blocking
              // console.error(err)
              this.sharedService.showError('Error', '¡unexpected error!');
            });
        });
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
  signedTransactionPromise(common: any): Promise<any> {
    const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
    const name: string = this.namespaceForm.get('name').value || this.renewNamespaceForm.get('name').value
    const duration: number = this.namespaceForm.get('duration').value || this.renewNamespaceForm.get('duration').value

    if (this.typetransfer == 1) {
      const registerRootNamespaceTransaction = this.proximaxProvider.registerRootNamespaceTransaction(name, this.walletService.network, duration)
      const signedTransaction = account.sign(registerRootNamespaceTransaction);
      return Promise.resolve(signedTransaction);
    } else if (this.typetransfer == 2) {
      const rootNamespaceName = this.namespaceForm.get('namespaceRoot').value;
      const subnamespaceName = this.namespaceForm.get('name').value;
      const registersubamespaceTransaction = this.proximaxProvider.registersubNamespaceTransaction(rootNamespaceName, subnamespaceName, this.walletService.network)
      const signedTransaction = account.sign(registersubamespaceTransaction);
      return Promise.resolve(signedTransaction);
    }
  }
}
