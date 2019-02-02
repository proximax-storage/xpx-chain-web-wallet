import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { WalletService, SharedService } from '../../../../shared';
import { NemProvider } from '../../../../shared/services/nem.provider';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AppConfig } from '../../../../config/app.config';
import { element } from '@angular/core/src/render3';

@Component({
  selector: 'app-create-namespace',
  templateUrl: './create-namespace.component.html',
  styleUrls: ['./create-namespace.component.scss']
})
export class CreateNamespaceComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  private namespaceForm: FormGroup;
  private namespace: object;
  private fee: string;
  private feeType: string = 'XPX';
  private arrayselect: Array<object>
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
    this.arrayselect = [{
      value: '1',
      label: '.(New root Namespace)',
      selected: true,
      disabled: false
    }];
    this.getNamespaceName();
    const fee = '0.150000';
    this.fee = `${fee} ${this.feeType}`

  }

  /**
 * Get namespace
 *
 * @memberof CreateMosaicComponent
 */
  getNamespaceName() {
    let count = 0
    // console.log("namespaceName", this.route.snapshot.data['dataNamespace'].length)
    if (this.route.snapshot.data['dataNamespace'].value !== null) {
      this.blockUI.start('Loading...'); // Start blocking
      for (let h of this.route.snapshot.data['dataNamespace']) {
        this.nemProvider.namespaceHttp.getNamespacesName(h.levels).pipe(first()).subscribe(
          (namespaceName: any) => {
            // console.log('nameN:', namespaceName)


            this.namespaceNameSelect(Object.values(namespaceName.reduce((prev, next) => Object.assign(prev, { [next.name]: next }), {}))).then(resp => {
              // console.log('response namespaceName ', resp)
              // console.log(`resp${resp.length} == namespace${this.route.snapshot.data['dataNamespace'].length+1}`)
              if (resp.length === this.route.snapshot.data['dataNamespace'].length + 1) {
                this.blockUI.stop(); // Stop blocking

                this.namespace = resp
              }

            });
          }, (error: any) => {
            this.blockUI.stop(); // Stop blocking
            console.error("Has ocurred a error", error);
            this.router.navigate([AppConfig.routes.home]);
            this.sharedService.showError('', error);
          });
        ++count
      }
    } else {
      this.namespace = [{
        value: '1',
        label: '.(New root Namespace)',
        selected: true,
        disabled: true
      }];
    }
  }

  namespaceNameSelect(value: any = []): Promise<any> {
    value = (value == null) ? [] : value

    // console.log('leng', value.length)

    if (value.length > 1) {
      // console.log('value',value)
      value.forEach((item, index) => {
        if (item.parentId == undefined) {
          const filtro = value.filter((book, pos, arr) => (book.parentId != undefined) && (book.parentId.id.lower === item.namespaceId.id.lower))
            .forEach((book, index) => {
              this.arrayselect.push({
                value: `${item.name}.${book.name}`, label: `${item.name}.${book.name}`, selected: false,
                disabled: false
              });
            });
        }
      })
    } else {
      this.arrayselect.push({
        value: value[0].name, label: value[0].name, selected: false,
        disabled: false
      });

    }
    // console.log('arrayselect', this.arrayselect)
    return Promise.resolve(this.arrayselect);
  }

  createForm() {
    this.namespaceForm = this.fb.group({
      name: ['', Validators.required],
      namespace: ['1'],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],

    });
    // this.namespaceForm.get('name').valueChanges.subscribe(options => {
    //   this.disableInputs()
    // })

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
    }
  }

  getNamespace() {
    this.blockUI.start('Loading...'); // Start blocking
    this.nemProvider.getNamespace(this.namespaceForm.get('name').value).subscribe(
      res => {
        this.blockUI.stop(); // Stop blocking
        this.sharedService.showError('Error', 'namespace already exists!');
      },
      error => {
        if (error.status === 404) {
          this.blockUI.stop(); // Stop blocking
          this.sharedService.showSuccess('success', 'name available')
        }

      }
    )
  }
  resectForm() {
    this.namespaceForm.get('name').patchValue('')
    this.namespaceForm.get('password').patchValue('')
    this.namespaceForm.get('namespace').patchValue('1')

  }

  create() {
    if (this.namespaceForm.valid) {
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
}
