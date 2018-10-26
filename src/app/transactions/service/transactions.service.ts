import { Injectable} from '@angular/core';
import { Observable, Subject, BehaviorSubject, } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TransactionsService   {
  private _transConfirm = new BehaviorSubject<any>([]);
  private _transConfirm$: Observable<any> = this._transConfirm.asObservable();
  constructor(

  ) {
  
  }

  getTransConfirm$(): Observable<any> {
    return this._transConfirm$;
  }

  setTransConfirm$(data){
    this._transConfirm.next(data);
  }





}
