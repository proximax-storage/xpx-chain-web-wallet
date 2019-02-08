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
  namespaceForm: FormGroup;
  private validateForm: boolean = false ;
  private namespace: Array<object> = [{
    value: '1',
    label: '.(New root Namespace)',
    selected: true,
    disabled: false
  }];
  private fee: string;
  private feeType: string = 'XPX';
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
      for (let space of this.route.snapshot.data['dataNamespace']) {
        if (space.depth == 1) {
          const responseRoot = await this.getNameSpaceRoot(space, space.active);
        } else if (space.depth == 2) {
          const responseSub = await this.getNameSpaceSub(space, space.active);
        } else if (space.depth == 3) {
          const responseSub = await this.getNameSpaceSubnivel(space, space.active);
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

  async getNameSpaceSub(subNamespace: any, status: boolean) {
    const id = subNamespace.levels.filter((book, pos, arr) => (book.id.lower !== subNamespace.parentId.id.lower))
    const promise = new Promise((resolve, reject) => {
      this.nemProvider.namespaceHttp.getNamespacesName(id).pipe(first()).subscribe(
        (namespaceName: any) => {
          const namespc = namespaceName.sort()
          this.namespace.push({
            value: `${namespc[1].name}.${namespc[0].name}`, label: `${namespc[1].name}.${namespc[0].name}`, selected: false,
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

  async getNameSpaceSubnivel(subNamespace: any, status: boolean) {
    const id = subNamespace.levels.filter((book, pos, arr) => (book.id.lower !== subNamespace.parentId.id.lower))
    const promise = new Promise((resolve, reject) => {
      this.nemProvider.namespaceHttp.getNamespacesName(id).pipe(first()).subscribe(
        (namespaceName: any) => {
          const namespc = namespaceName.sort()
          this.namespace.push({
            value: `${namespc[1].name}.${namespc[2].name}.${namespc[0].name}`, label: `${namespc[1].name}.${namespc[2].name}.${namespc[0].name}`, selected: false,
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
    this.namespaceForm.get('name').valueChanges.subscribe(name => {
      if (!this.namespaceIsValid(name)) return this.sharedService.showError('Error', '¡Name of namespace is invalid!!')
    })
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
  getError(param, formControl?) {
    if (this.namespaceForm.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.namespaceForm.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.namespaceForm.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.namespaceForm.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.namespaceForm.get(param).getError('maxlength').requiredLength} characters`;
    } else if (this.namespaceForm.get(param).getError('pattern')) {
      return `This field content characters not permited`;
    }
  }

  //   processNamespaceName() {
  //     // Lowercase namespace name
  //     this.formData.namespaceName = this._$filter('lowercase')(this.formData.namespaceName);
  //     // Check namespace validity
  //     if (!this.namespaceIsValid(this.formData.namespaceName)) return this._Alert.invalidNamespaceName();
  // }
  create() {
    if (this.namespaceForm.valid && this.validateForm ) {
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

  signedTransactionPromise(common): Promise<any> {
    const account = this.nemProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
    if (this.namespaceForm.get('namespace').value != 1) {
      const rootNamespaceName = this.namespaceForm.get('namespace').value;
      const subnamespaceName = this.namespaceForm.get('name').value;
      const registersubamespaceTransaction = this.nemProvider.registersubNamespaceTransaction(rootNamespaceName, subnamespaceName, this.walletService.network)
      const signedTransaction = account.sign(registersubamespaceTransaction);
      return Promise.resolve(signedTransaction);
    } else {
      const registerRootNamespaceTransaction = this.nemProvider.registerRootNamespaceTransaction(this.namespaceForm.get('name').value, this.walletService.network)
      const signedTransaction = account.sign(registerRootNamespaceTransaction);
      return Promise.resolve(signedTransaction);
    }
  }

  resectForm() {
    this.namespaceForm.get('name').patchValue('')
    this.namespaceForm.get('password').patchValue('')
    this.namespaceForm.get('namespace').patchValue('1')

  }

}
