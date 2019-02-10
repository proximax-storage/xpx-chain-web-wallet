import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { WalletService, SharedService } from '../../../../shared';
import { NemProvider } from '../../../../shared/services/nem.provider';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AppConfig } from '../../../../config/app.config';

@Component({
  selector: 'app-create-namespace',
  templateUrl: './create-namespace.component.html',
  styleUrls: ['./create-namespace.component.scss']
})
export class CreateNamespaceComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public namespaceForm: FormGroup;
  public namespaceRenewForm: FormGroup;
  public namespachangeinfo: any
  public startHeight: number
  public endHeight: number
  private validateForm: boolean = false;
  private status: boolean = true
  private statusbuttonNamespace: boolean = true

  private namespaceInfo: Array<object> = []
  private typetransfer: number = 1;
  private namespace: Array<object> = [{
    value: '1',
    label: '.(New root Namespace)',
    selected: true,
    disabled: false
  }];
  private fee: string;
  private feeType: string = 'XPX';
  private labelnamespace: string = '';
  private arrayselect: Array<object> = [{
    value: '1',
    label: '.(New root Namespace)',
    selected: true,
    disabled: false
  }];
  validateNamespace = true;
  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private router: Router,

  ) { }

  ngOnInit() {
    this.createForm();
    this.getNamespaceName();
    const fee = '0.0';
    this.fee = `${fee} ${this.feeType}`

  }
  /**
  * Get namespace
  *
  * @memberof CreateMosaicComponent
  */
  async getNamespaceName() {
    if (this.route.snapshot.data['dataNamespace'].value !== null) {
      this.blockUI.start('Loading...'); // Start blocking
      for (let dataNamespace of this.route.snapshot.data['dataNamespace']) {
        if (dataNamespace.depth == 1) {
          await this.getNameSpaceRoot(dataNamespace, dataNamespace.active);
        }
        // else if (dataNamespace.depth == 2) {
        //   await this.getNameSpaceSub(dataNamespace, dataNamespace.active);
        // } 
        else {
          await this.getNameSpaceSubnivel(dataNamespace, dataNamespace.active, dataNamespace.depth);
        }
      }
    }
    this.blockUI.stop();
    this.arrayselect = this.namespace.sort(function (a: any, b: any) {
      return a.label == b.label ? 0 : +(a.label > b.label) || -1;
    })
  }

  async getNameSpaceRoot(rootNamespace: any, status: boolean) {
    const promise = new Promise((resolve, reject) => {
      this.nemProvider.namespaceHttp.getNamespacesName(rootNamespace.levels).pipe(first()).subscribe(
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
          console.error("Has ocurred a error", error);
          // this.router.navigate([AppConfig.routes.home]);
          this.sharedService.showError('', error);
          reject(error);
        });
    });
    return await promise;
  }
  async getNameSpaceSubnivel(subNamespace: any, status: boolean, depth: number) {

    const promise = new Promise((resolve, reject) => {
      this.nemProvider.namespaceHttp.getNamespacesName([subNamespace.levels[depth - 1]]).pipe(first()).subscribe(
        (namespaceName: any) => {
          this.labelnamespace = ''
          const name = this.ordernamespace(namespaceName.sort())
          this.namespace.push({
            value: name, label: name, selected: false,
            disabled: false
          });
          resolve(true);
        }, (error: any) => {
          this.blockUI.stop(); // Stop blocking
          console.error("Has ocurred a error", error);
          this.router.navigate([AppConfig.routes.home]);
          this.sharedService.showError('', error);
          reject(error);
        });
    });
    return await promise;
  }

  createForm() {
    this.namespaceForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(64)]],
      namespace: ['1'],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });
    this.namespaceRenewForm = this.fb.group({
      name: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(64)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });


    this.namespaceForm.get('namespace').valueChanges.subscribe(namespace => {
      this.typetransfer = (namespace == 1) ? 1 : 2
    })

    this.namespaceForm.get('name').valueChanges.subscribe(name => {
      if (!this.namespaceIsValid(name)) return this.sharedService.showError('Error', '¡Name of namespace is invalid!!')
    })
  }

  ordernamespace(value, old: any = '') {
    if (value.length) {
      for (let i of value) {
        if (i.parentId == undefined && old == '') {
          this.labelnamespace = this.labelnamespace.concat(`${i.name}`)
          this.ordernamespace(value.filter(function (value) {
            return value.namespaceId.id.lower != i.namespaceId.id.lower;
          }), i)
          break
        } else if (i.parentId != undefined && old != '') {
          if (i.parentId.id.lower == old.namespaceId.id.lower) {
            this.labelnamespace = this.labelnamespace.concat(`.${i.name}`)
            this.ordernamespace(value.filter(function (value) {
              return value.namespaceId.id.lower != i.namespaceId.id.lower;
            }), i)
            break
          }
        }
      }
      return this.labelnamespace
    }
  }
  namespaceIsValid(ns, isParent?) {
    // Test if correct length and if name starts with hyphens
    if (!isParent ? ns.length > 16 : ns.length > 64 || /^([_-])/.test(ns)) {
      return false;
    }
    let pattern = /^[a-z0-9.\-_]*$/;
    // Test if has special chars or space excluding hyphens
    if (pattern.test(ns) == false) {
      this.validateForm = false;
      return false;
    } else {
      this.validateForm = true;
      return true;
    }
  }

  /**
   *
   * @param param
   * @param formControl
   */
  getError(control: string | (string | number)[], typeForm?: any, formControl?: string | number) {
    const form = (typeForm === undefined) ? this.namespaceForm : this.namespaceRenewForm;
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
  createNamespace() {
    if (this.namespaceForm.valid && this.validateForm) {
      const common = {
        password: this.namespaceForm.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        this.signedTransactionPromise(common).then(signedTransaction => {

          this.nemProvider.announce(signedTransaction).subscribe(
            x => {
              console.log(x)
              this.resectForm()
              this.blockUI.stop(); // Stop blocking
              this.sharedService.showSuccess('success', 'create namespace sent')
            },
            err => {
              this.resectForm()
              this.blockUI.stop(); // Stop blocking
              console.error(err)
              this.sharedService.showError('Error', '¡unexpected error!');
            });
        });
      }
    }
  }

  renewNamespace() {
    this.typetransfer = 1
    this.namespaceForm.get('name').patchValue('')
    this.namespaceForm.get('password').patchValue('')
    if (this.namespaceRenewForm.valid) {
      const common = {
        password: this.namespaceRenewForm.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        this.signedTransactionPromise(common).then(signedTransaction => {

          this.nemProvider.announce(signedTransaction).subscribe(
            x => {
              // this.basicModal.hide()
              console.log(x)
              this.resectForm()
              this.blockUI.stop(); // Stop blocking
              this.sharedService.showSuccess('success', 'renew namespace sent')
            },
            err => {
              this.resectForm()
              this.blockUI.stop(); // Stop blocking
              console.error(err)
              this.sharedService.showError('Error', '¡unexpected error!');
            });
        });
      }
    }
  }


  signedTransactionPromise(common): Promise<any> {
    const account = this.nemProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
    const name = this.namespaceForm.get('name').value || this.namespaceRenewForm.get('name').value
    if (this.typetransfer == 1) {
      const registerRootNamespaceTransaction = this.nemProvider.registerRootNamespaceTransaction(name, this.walletService.network)
      const signedTransaction = account.sign(registerRootNamespaceTransaction);
      return Promise.resolve(signedTransaction);
    } else if (this.typetransfer == 2) {
      const rootNamespaceName = this.namespaceForm.get('namespace').value;
      const subnamespaceName = this.namespaceForm.get('name').value;
      const registersubamespaceTransaction = this.nemProvider.registersubNamespaceTransaction(rootNamespaceName, subnamespaceName, this.walletService.network)
      const signedTransaction = account.sign(registersubamespaceTransaction);
      return Promise.resolve(signedTransaction);
    }
  }

  /**
  *Change of selection option
  *
  * @param {*} namespace
  * @memberof CreateNamespaceComponent
  */
  private optionSelected(namespace: any) {
    this.namespachangeinfo = this.namespaceInfo.filter((book: any) => (book.name === namespace.value))
    
    
    if (this.namespachangeinfo.length > 0) {
      console.log(this.namespachangeinfo )
      this.startHeight = this.namespachangeinfo[0].dataNamespace.startHeight.lower
      this.endHeight = this.namespachangeinfo[0].dataNamespace.endHeight.lower
      this.namespaceRenewForm.get('name').patchValue(this.namespachangeinfo[0].name)
      this.statusbuttonNamespace = (this.namespachangeinfo[0].dataNamespace.depth == 1) ? false : true
    } else {
      this.statusbuttonNamespace = true
    }
  }

  resectForm() {
    this.namespaceForm.get('name').patchValue('')
    this.namespaceForm.get('password').patchValue('')
    this.namespaceForm.get('namespace').patchValue('1')
    this.statusbuttonNamespace = true

  }

}
