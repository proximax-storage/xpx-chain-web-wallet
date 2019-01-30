import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { WalletService, SharedService } from '../../../../shared';
import { NemProvider } from '../../../../shared/services/nem.provider';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { rootRoute } from '@angular/router/src/router_module';

@Component({
  selector: 'app-create-namespace',
  templateUrl: './create-namespace.component.html',
  styleUrls: ['./create-namespace.component.scss']
})
export class CreateNamespaceComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  private namespaceForm: FormGroup;
  private rootNamespace:object;
  private fee:string; 
  private feeType:string = 'XPX';
  validateNamespace = true;
  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private sharedService: SharedService,
   
  ) { }

  ngOnInit() {
    this.createForm();
const fee  = '0.150000';
this.fee= `${fee}   ${this.feeType}`
   this.rootNamespace = [{ 'value': '', 'label': '.(New root Namespace)' }]
  }

  createForm() {
    this.namespaceForm = this.fb.group({
      name: ['', Validators.required],
      rootNamespace: ['', Validators.required],
      // duration: [{ value: '', disabled: this.validateNamespace }, [Validators.required, Validators.minLength(1)]],
      password: [{ value: '', disabled: this.validateNamespace }, [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],

    });
    this.namespaceForm.get('name').valueChanges.subscribe(options => {
      this.disableInputs()
    })

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
        this.disableInputs()
        this.blockUI.stop(); // Stop blocking
        this.sharedService.showError('Error', 'namespace already exists!');
      },
      error => {
        if (error.status === 404) {

          this.enableInputs()
          this.blockUI.stop(); // Stop blocking
          this.sharedService.showSuccess('success', 'name available')
        }

      }
    )
  }

  enableInputs() {
    this.validateNamespace = false;
    // this.namespaceForm.get('duration').enable()
    this.namespaceForm.get('password').enable()

  }

  disableInputs() {
    this.validateNamespace = true;
    // this.namespaceForm.get('duration').patchValue('')
    this.namespaceForm.get('password').patchValue('')
    // this.namespaceForm.get('duration').disable()
    this.namespaceForm.get('password').disable()
  }

  create() {
    if (this.namespaceForm.valid && !this.validateNamespace) {
      const common = {
        password: this.namespaceForm.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        const account = this.nemProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
        const registerNamespaceTransaction = this.nemProvider.registerNamespaceTransaction(this.namespaceForm.get('name').value,this.walletService.network)
        const signedTransaction = account.sign(registerNamespaceTransaction);
        console.log('hast',signedTransaction.hash)
        console.log('type',signedTransaction.type)
        console.log('signer',signedTransaction.signer)
        this.nemProvider.announce(signedTransaction).subscribe(
          x => {
            console.log(x)
            this.blockUI.stop(); // Stop blocking
            this.sharedService.showSuccess('success', 'create namespace sent')
          },
          err => {
            this.blockUI.stop(); // Stop blocking
            console.error(err)
            this.sharedService.showError('Error', '¡unexpected error!');
          });


      }
    }
  }

}
