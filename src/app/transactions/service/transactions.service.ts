import { Injectable ,OnInit} from '@angular/core';
import { NemProvider } from '../../shared/services/nem.provider';
import { WalletService } from '../../shared/services/wallet.service';
import { mergeMap, } from 'rxjs/operators'
import { Observable, Subject, BehaviorSubject, } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TransactionsService  implements OnInit {
  private _transConfirm = new BehaviorSubject<any>([]);
  private _transConfirm$: Observable<any> = this._transConfirm.asObservable();
  constructor(
    private nemProvider: NemProvider,
    private walletService: WalletService
  ) {
  
  }

  ngOnInit() {
    console.log("asdas")
    this.nemProvider.getAllTransactionsFromAnAccount(this.walletService.publicAccount, this.walletService.network).subscribe(
      trans => {
        console.log("aca")
        console.log("asdasdasdasdasdasd:",trans)
        this.setTransConfirm$(trans);
      },
      error => {
        console.error(error);
      })


  }
  getTransConfirm$(): Observable<any> {
    return this._transConfirm$;
  }

  setTransConfirm$(data){
    this._transConfirm.next(data);
  }





}
