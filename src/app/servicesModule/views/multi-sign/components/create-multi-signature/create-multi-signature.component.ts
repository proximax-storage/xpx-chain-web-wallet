import { Component, OnInit } from '@angular/core';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { AppConfig } from 'src/app/config/app.config';
import { SharedService, ConfigurationForm } from 'src/app/shared/services/shared.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { Account, PublicAccount, ModifyMultisigAccountTransaction, Deadline, MultisigCosignatoryModification, UInt64, NetworkType, Address } from 'tsjs-xpx-chain-sdk';

@Component({
  selector: 'app-create-multi-signature',
  templateUrl: './create-multi-signature.component.html',
  styleUrls: ['./create-multi-signature.component.css']
})
export class CreateMultiSignatureComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  headElements = ['Address', 'Action', 'Remove'];
  configurationForm: ConfigurationForm = {};
  createMultsignForm: FormGroup;
  modifyMultisigAccountTransactionObject: ModifyMultisigAccountTransactionObject;
  cosignatoryList: CosignatoryList[] = [];
  minApprovaMaxLength: number = 1;
  minApprovaMinLength: number = 0;
  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService
  ) {
    this.configurationForm = this.sharedService.configurationForm;
  }
  ngOnInit() {
    this.createForm()
    this.subscribeValueChange();

    // cuenta multi firma    
    //9efe61fb49eea91fdfd89c80bae15b769c64e687917584473c823a6c0962ee90
    //TBFZFICV47MMUVYVHNOKJ3APF27SSW3AD6UV55OA



    //consignatario 
    //ac54e59fec8f0e1770e6e7cb35f7ecf3d6ed7356b9f88787d15d3d9bd01f90f9
    // TCQXBGF4VMERBI5AMXJCS7RXWGCYVWOWSN6E2VIV
  }
  /**
   *
   *
   * @memberof CreateMultiSignatureComponent
   */
  createForm() {
    //Form create multisignature default
    this.createMultsignForm = this.fb.group({
      privateKeyAccountMultisign: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.privateKey.minLength),
        Validators.maxLength(this.configurationForm.privateKey.maxLength),
        Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')]
      ],
      cosignatory: [''],
      minApprovalDelta: [1, [
        Validators.required, Validators.minLength(1),
        Validators.maxLength(1)]],
      minRemovalDelta: [1, [
        Validators.required, Validators.minLength(1),
        Validators.maxLength(1)]]
    });
    this.validatorsCosignatory();
  }

  /**
  *
  *
  * @memberof CreateMultiSignatureComponent
  */
  clearForm() {
    this.createMultsignForm.get('privateKeyAccountMultisign').patchValue('');
    this.createMultsignForm.get('cosignatory').patchValue('');
    this.createMultsignForm.get('minApprovalDelta').patchValue(1);
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof CreateMultiSignatureComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.createMultsignForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.createMultsignForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.createMultsignForm.get(nameInput);
    }
    return validation;
  }

  /**
  *
  *
  * @memberof CreateMultiSignatureComponent
  */
  convertIntoMultisigTransaction() {

    this.modifyMultisigAccountTransactionObject = {
      modifications: this.getCosignatoryList()
    }

    console.log("validador", this.createMultsignForm.valid)

    if (this.createMultsignForm.valid && this.cosignatoryList.length > 0) {
      console.log("enviar",this.modifyMultisigAccountTransactionObject)

    }

  }

  /**
  *
  *
  * @memberof CreateNamespaceComponent
  */
  subscribeValueChange() {
    // PrivateKeyAccountMultisign ValueChange
    this.createMultsignForm.get('privateKeyAccountMultisign').valueChanges.subscribe(
      next => {
        if ((next !== null && next !== undefined)
          && (this.createMultsignForm.get('privateKeyAccountMultisign').valid)) {
          this.modifyMultisigAccountTransactionObject = {
            accountMultisign: Account.createFromPrivateKey(next, this.walletService.network)
          }
          console.log()
        }
      }
    );

    // Cosignatory ValueChange
    this.createMultsignForm.get('cosignatory').valueChanges.subscribe(
      next => {
        if (next !== null && next !== undefined) {

        }
        this.validatorsCosignatory()
      }
    );
  }

  /**
   * Change the form validator (cosignatory)
   * @memberof CreateMultiSignatureComponent
   */
  validatorsCosignatory() {
    const validators = [
      Validators.required,
      Validators.minLength(this.configurationForm.publicKey.minLength),
      Validators.maxLength(this.configurationForm.publicKey.maxLength),
      Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')];
    if (this.cosignatoryList.length > 0 && (this.createMultsignForm.get('cosignatory').value === null
      || this.createMultsignForm.get('cosignatory').value === undefined
      || this.createMultsignForm.get('cosignatory').value === '')) {
      this.createMultsignForm.controls['cosignatory'].setValidators(null);
    } else {
      this.createMultsignForm.controls['cosignatory'].setValidators(validators);
    }
    this.createMultsignForm.controls['cosignatory'].updateValueAndValidity({ emitEvent: false });
  }

  /**
  * Change the form validator (minApprovalDelta)
  * @memberof CreateMultiSignatureComponent
  */
  validatorsMinApprovalDelta() {
    const validators = [Validators.required,
    Validators.minLength(1),
    Validators.maxLength(this.cosignatoryList.length)]
    this.minApprovaMinLength = 0;
    this.minApprovaMaxLength = this.cosignatoryList.length
    this.createMultsignForm.get('minApprovalDelta').patchValue(0);
    this.createMultsignForm.controls['minApprovalDelta'].setValidators(validators);
    this.createMultsignForm.controls['minApprovalDelta'].updateValueAndValidity({ emitEvent: false });

  }

  /**
* Change the form validator (minRemovalDelta)
* @memberof CreateMultiSignatureComponent
*/
  validatorsMinRemovalDelta() {
    const validators = [Validators.required,
    Validators.minLength(1),
    Validators.maxLength(this.cosignatoryList.length)]
    this.minApprovaMinLength = 0;
    this.minApprovaMaxLength = this.cosignatoryList.length
    this.createMultsignForm.get('minRemovalDelta').patchValue(0);
    this.createMultsignForm.controls['minRemovalDelta'].setValidators(validators);
    this.createMultsignForm.controls['minRemovalDelta'].updateValueAndValidity({ emitEvent: false });

  }

  /**
  * Add cosignatory to the board
  * @memberof CreateMultiSignatureComponent
  */
  addCosignatory() {
    if (this.createMultsignForm.get('cosignatory').valid) {
      const cosignatory: PublicAccount = PublicAccount.createFromPublicKey(
        this.createMultsignForm.get('cosignatory').value,
        this.walletService.network
      );
      if (!Boolean(this.cosignatoryList.find(item => { return item.publicAccount.address.plain() === cosignatory.address.plain() }))) {
        this.cosignatoryList.push({ publicAccount: cosignatory, action: 'Add', id: cosignatory.address });
        this.setCosignatoryList(this.cosignatoryList);
        this.createMultsignForm.get('cosignatory').patchValue('');
      }
    }
  }

  /**
  * Delete cosignatory to the board
  * @memberof CreateMultiSignatureComponent
  * @param id  - Address in cosignatory.
  */
  deleteCosignatory(id: Address) {
    this.cosignatoryList = this.cosignatoryList.filter(item => item.id.plain() !== id.plain());
    this.setCosignatoryList(this.cosignatoryList);
    this.validatorsCosignatory()
  }

  /**
  * Set cosignatory list
  * @memberof CreateMultiSignatureComponent
  * @param {CosignatoryList} [cosignatoryListParam] - list cosignatory 
  */
  setCosignatoryList(cosignatoryListParam: CosignatoryList[]) {
    this.cosignatoryList = cosignatoryListParam;
    this.validatorsMinApprovalDelta();
    this.validatorsMinRemovalDelta();
  }

  /**
    * Get cosignatory list
    * @memberof CreateMultiSignatureComponent
    * @return {CosignatoryList} list cosignatory 
    */
  getCosignatoryList(): CosignatoryList[] {
    return this.cosignatoryList;
  }

}

/**
 * Create a modify multisig account transaction object
 * @param deadline - The deadline to include the transaction.
 * @param minApprovalDelta - The min approval relative change.
 * @param minRemovalDelta - The min removal relative change.
 * @param modifications - The array of modifications.
 * @param networkType - The network type.
 * @param maxFee - (Optional) Max fee defined by the sender
*/
export interface ModifyMultisigAccountTransactionObject {
  deadline?: Deadline;
  accountMultisign?: Account;
  minApprovalDelta?: number;
  minRemovalDelta?: number;
  modifications?: CosignatoryList[];
  networkType?: NetworkType,
  maxFee?: UInt64
}
/**
 * cosignatory List
 * @param publicAccount
 * @param action - event (Add or delete)
 * @param id - Address in cosignatory
*/
export interface CosignatoryList {
  publicAccount: PublicAccount;
  action: string;
  id: Address;
}
