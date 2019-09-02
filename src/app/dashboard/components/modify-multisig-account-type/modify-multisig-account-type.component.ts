import { Component, OnInit, Input } from '@angular/core';
import { TransactionsService } from '../../../transactions/services/transactions.service';
import { PaginationInstance } from 'ngx-pagination';
import { ModifyMultisigAccountTransaction } from 'tsjs-xpx-chain-sdk';

@Component({
  selector: 'app-modify-multisig-account-type',
  templateUrl: './modify-multisig-account-type.component.html',
  styleUrls: ['./modify-multisig-account-type.component.css']
})
export class ModifyMultisigAccountTypeComponent implements OnInit {

  @Input() multisigAccount: ModifyMultisigAccountTransaction = null;


  constructor(
    public transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

}
