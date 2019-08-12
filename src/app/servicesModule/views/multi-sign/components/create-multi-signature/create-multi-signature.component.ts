import { Component, OnInit } from '@angular/core';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { AppConfig } from 'src/app/config/app.config';
import { SharedService, ConfigurationForm } from 'src/app/shared/services/shared.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { Account, PublicAccount, ModifyMultisigAccountTransaction, Deadline, MultisigCosignatoryModification, UInt64, NetworkType, Address, MultisigCosignatoryModificationType } from 'tsjs-xpx-chain-sdk';

@Component({
  selector: 'app-create-multi-signature',
  templateUrl: './create-multi-signature.component.html',
  styleUrls: ['./create-multi-signature.component.css']
})
export class CreateMultiSignatureComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  publicAccountToConvert: PublicAccount;

  blockSend: boolean;
  configurationForm: ConfigurationForm = {};
  createMultsignForm: FormGroup;
  currentAccounts: any = [];
  currentAccountToConvert: any;
  cosignatoryList: CosignatoryList[] = [];
  headElements: string[];
  modifyMultisigAccountTransactionObject: ModifyMultisigAccountTransactionObject;
  minApprovaMaxLength: number = 1;
  minApprovaMinLength: number = 0;
  accountToConvert: Account;


  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,

  ) {
    this.headElements = ['Address', 'Action', 'Remove'];
    this.configurationForm = this.sharedService.configurationForm;
    this.blockSend = false;
    this.currentAccounts = []
  }
  ngOnInit() {
    this.createForm()
    this.subscribeValueChange();
    this.getAccounts();

    // cuenta multi firma    
    //9efe61fb49eea91fdfd89c80bae15b769c64e687917584473c823a6c0962ee90
    //TBFZFICV47MMUVYVHNOKJ3APF27SSW3AD6UV55OA



    //consignatario 
    //ac54e59fec8f0e1770e6e7cb35f7ecf3d6ed7356b9f88787d15d3d9bd01f90f9
    // TCQXBGF4VMERBI5AMXJCS7RXWGCYVWOWSN6E2VIV

    //sin key
    //4c18c4d267dc2a249bbf2edf95ae931e20cd34d80e3611f653873fbab05ffc39
    //TAINL455O6TEF3FJDK63FKY7KCFATMWFGYMQRLOS
  }

  /**
   *
   *
   * @memberof CreateMultiSignatureComponent
   */
  createForm() {
    //Form create multisignature default
    this.createMultsignForm = this.fb.group({
      selectAccount: ['', [
        Validators.required
      ]
      ],
      cosignatory: [''],
      minApprovalDelta: [1, [
        Validators.required, Validators.minLength(1),
        Validators.maxLength(1)]],
      minRemovalDelta: [1, [
        Validators.required, Validators.minLength(1),
        Validators.maxLength(1)]],
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]
      ],
    });
    this.validatorsCosignatory();
  }

  /**
  *
  *
  * @memberof CreateMultiSignatureComponent
  */
  clearForm() {
    this.createMultsignForm.get('selectAccount').patchValue('', { emitEvent: false });
    this.createMultsignForm.get('cosignatory').patchValue('', { emitEvent: false });
    this.createMultsignForm.get('minRemovalDelta').patchValue(1, { emitEvent: false });

  }

  /**
 *
 *
 * @memberof CreateMultiSignatureComponent
 */
  clearData() {
    // this.createMultsignForm.get('selectAccount').patchValue('');
    this.createMultsignForm.get('cosignatory').patchValue('', { emitEvent: false });
    this.createMultsignForm.get('minApprovalDelta').patchValue(1, { emitEvent: false });
    this.createMultsignForm.get('minRemovalDelta').patchValue(1, { emitEvent: false });
    this.cosignatoryList = []
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
   * Get accounts wallet
   * @memberof CreateMultiSignatureComponent
   */
  getAccounts() {

    this.walletService.current.accounts.forEach(element => {
      this.currentAccounts.push({
        label: element.name,
        value: element
      });
    });
  }

  /**
  *
  *
  * @memberof CreateMultiSignatureComponent
  */
  convertIntoMultisigTransaction() {
    this.blockSend = true;
    let common: any = { password: this.createMultsignForm.get("password").value };

    if (this.walletService.decrypt(common, this.currentAccountToConvert, this.currentAccountToConvert.algo, this.currentAccountToConvert.network)) {

      if (this.createMultsignForm.valid && this.cosignatoryList.length > 0) {
        this.accountToConvert = Account.createFromPrivateKey(common.privateKey, this.currentAccountToConvert.network)
        // common = '';
        this.modifyMultisigAccountTransactionObject = {
          deadline: Deadline.create(),
          accountToConvert: this.accountToConvert,
          modifications: this.multisigCosignatoryModification(this.cosignatoryList,
            MultisigCosignatoryModificationType.Add),
          minApprovalDelta: this.createMultsignForm.get('minApprovalDelta').value,
          minRemovalDelta: this.createMultsignForm.get('minRemovalDelta').value,
          networkType: this.currentAccountToConvert.network
        }
        const convertIntoMultisigTransaction = ModifyMultisigAccountTransaction.create(
          this.modifyMultisigAccountTransactionObject.deadline,
          this.modifyMultisigAccountTransactionObject.minApprovalDelta,
          this.modifyMultisigAccountTransactionObject.minRemovalDelta,
          this.modifyMultisigAccountTransactionObject.modifications,
          this.modifyMultisigAccountTransactionObject.networkType);

          console.log("convertIntoMultisigTransaction:",convertIntoMultisigTransaction)
          this.blockSend = false;
      }
    } else {
      this.blockSend = false;

    }
  }

  /**
   * With a multisig cosignatory modification a cosignatory is added to or deleted from a multisig account.
   *
   * @memberof CreateMultiSignatureComponent
   * @param {CosignatoryList}  cosignatoryList  - Cosignatory list.
   * @param {MultisigCosignatoryModificationType} type  - type modification.
   */
  multisigCosignatoryModification(cosignatoryList: CosignatoryList[], type: MultisigCosignatoryModificationType): MultisigCosignatoryModification[] {
    const cosignatory = []
    for (let index = 0; index < cosignatoryList.length; index++) {
      const element = cosignatoryList[index];
      cosignatory.push(
        new MultisigCosignatoryModification(
          type,
          cosignatoryList[index].publicAccount,
        )
      )
    }
    return cosignatory
  }

  /**
  *
  *
  * @memberof CreateNamespaceComponent
  * 
  */
  subscribeValueChange() {
    // Cosignatory ValueChange
    this.createMultsignForm.get('cosignatory').valueChanges.subscribe(
      next => {
        if (next !== null && next !== undefined) {

        }
        this.validatorsCosignatory()
      }
    );
  }
  selectAccount($event: Event) {
    this.clearData()
    const account: any = $event
    this.currentAccountToConvert = account.value;
    this.publicAccountToConvert = PublicAccount.createFromPublicKey(this.currentAccountToConvert.publicAccount.publicKey, this.currentAccountToConvert.network)
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
      // Cosignatory needs a public key
      // if (!this.cosignatoryPubKey) return this._Alert.cosignatoryhasNoPubKey();

      // Multisig cannot be cosignatory
      if (this.publicAccountToConvert.address.plain() === cosignatory.address.plain())
        return this.sharedService.showError('Attention', 'A multisig account cannot be set as cosignatory');

      // Check presence in cosignatory List array
      if (!Boolean(this.cosignatoryList.find(item => { return item.publicAccount.address.plain() === cosignatory.address.plain() }))) {
        this.cosignatoryList.push({ publicAccount: cosignatory, action: 'Add', id: cosignatory.address });
        this.setCosignatoryList(this.cosignatoryList);
        this.createMultsignForm.get('cosignatory').patchValue('');
      } else {
        this.sharedService.showError('Attention', 'Cosignatory is already present in modification list');
      }
    }
  }

  /**
  * Delete cosignatory to the cosignatory List
  * @memberof CreateMultiSignatureComponent
  * @param id  - Address in cosignatory.
  */
  deleteCosignatory(id: Address) {
    const cosignatoryList = this.cosignatoryList.filter(item => item.id.plain() !== id.plain());
    this.setCosignatoryList(cosignatoryList);
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
  accountToConvert?: Account;
  minApprovalDelta?: number;
  minRemovalDelta?: number;
  modifications?: MultisigCosignatoryModification[];
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
