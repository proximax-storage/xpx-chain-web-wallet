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
      cosignatory: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.publicKey.minLength),
        Validators.maxLength(this.configurationForm.publicKey.maxLength)]
      ],

    });
  }

  /**
  *
  *
  * @memberof CreateMultiSignatureComponent
  */
  clearForm() {
    this.createMultsignForm.get('privateKeyAccountMultisign').patchValue('');
    this.createMultsignForm.get('cosignatory').patchValue('');
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
    console.log("enviar")
  }

  /**
  *
  *
  * @memberof CreateNamespaceComponent
  */
  subscribeValueChange() {
    // privateKeyAccountMultisign ValueChange
    this.createMultsignForm.get('privateKeyAccountMultisign').valueChanges.subscribe(
      next => {
        if ((next !== null && next !== undefined)
          && (this.createMultsignForm.get('privateKeyAccountMultisign').valid)) {
          this.modifyMultisigAccountTransactionObject = {
            accountMultisign: Account.createFromPrivateKey(next, this.walletService.network)
          }
        }
      }
    );
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
