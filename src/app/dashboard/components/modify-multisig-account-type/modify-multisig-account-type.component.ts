import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
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

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    console.log(this.multisigAccount);
  }

}
