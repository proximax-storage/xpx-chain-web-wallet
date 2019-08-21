import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MultiSignService {

  minApprovaMaxCalc: number;
  minApprovaMinCalc: number;
  constructor() { }




  calcMinDelta(minApprovalDeltaE: number, minRemovalDeltaE: number, minApprovalDeltaM: number, minRemovalDeltaM: number) {
    return new Object({
      minApprovalDelta: minApprovalDeltaM - minApprovalDeltaE,
      minRemovalDelta: minRemovalDeltaM - minRemovalDeltaE

    })
  }
}
