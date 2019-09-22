import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';
import { MosaicService, MosaicsStorage } from 'src/app/servicesModule/services/mosaic.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-transfer-type',
  templateUrl: './transfer-type.component.html',
  styleUrls: ['./transfer-type.component.css']
})
export class TransferTypeComponent implements OnInit {

  @Input() transferTransaction: TransactionsInterface;
  searching = true;
  simple = null;
  typeTransactionHex: string;
  msg = '';
  amountTwoPart: { part1: string; part2: string; };
  nis1hash: any;
  // E7620BC08F46B1B56A9DF29541513318FD51965229D4A4B3B3DAAFE82819DE46

  constructor(
    public transactionService: TransactionsService,
    private mosaicService: MosaicService,
    private proximaxProvider: ProximaxProvider
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    console.log(this.transferTransaction);
    this.searching = true;
    this.typeTransactionHex = `${this.transferTransaction.data['type'].toString(16).toUpperCase()}`;
    if (this.transferTransaction.data['message'].payload !== '') {
      try {
        const simple = false;
        if (this.transferTransaction.sender.address.plain() === environment.swapAccount.address) {
          const msg = JSON.parse(this.transferTransaction.data['message'].payload);
          if (msg && msg['type'] === 'Swap') {
            this.msg = msg['message'];
            this.nis1hash = msg['nis1Hash'];
            if (this.transferTransaction.data['mosaics'].length > 0) {
              // console.log(this.transferTransaction.data['mosaics'][0].amount.compact());
              const amount = this.transactionService.amountFormatterSimple(this.transferTransaction.data['mosaics'][0].amount.compact());
              this.amountTwoPart = this.transactionService.getDataPart(amount.toString(), 6);
              // console.log('----> ', this.amountTwoPart);
              this.simple = false;
            } else {
              this.simple = false;
            }
          } else {
            this.simple = true;
          }
        } else {
          this.simple = true;
        }
      } catch (error) {
        // console.log(error);
        this.simple = true;
      }
    } else {
      this.simple = true;
    }
  }

}
