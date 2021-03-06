import { Injectable } from '@angular/core';
import { Convert, UInt64, PublicAccount } from 'tsjs-xpx-chain-sdk';

@Injectable({
  providedIn: 'root'
})
export class GiftService {
  typeDonwnload: string = ''
  imgFileData: Blob = null
  zipFileData: any = null
  constructor() { }


  get getTypeDonwnload(): string {
    return this.typeDonwnload;
  }
  set setTypeDonwnload(val: string) {
    this.typeDonwnload = val;
  }

  get getImgFileData(): Blob {
    return this.imgFileData;
  }
  set setImgFileData(val: Blob) {
    this.imgFileData = val;
  }

  get getZipFileData(): any {
    return this.zipFileData;
  }
  set setZipFileData(val: any) {
    this.zipFileData = val;
  }

  unSerialize(hex): DataDececode {
    try {
      const dataUin8 = Convert.hexToUint8(hex)
      const amountUin8 = new Uint8Array(8)
      let amountUin32 = new Uint32Array(2)
      const pkUin8 = new Uint8Array(32)
      const desUin8 = new Uint8Array(20)
      amountUin8.set(new Uint8Array(dataUin8.subarray(0, 8)), 0)
      pkUin8.set(new Uint8Array(dataUin8.subarray(8, 40)), 0)
      desUin8.set(new Uint8Array(dataUin8.subarray(40, dataUin8.byteLength)), 0)
      amountUin32 = Convert.uint8ToUint32(amountUin8)
      const amount = UInt64.fromHex(Convert.uint8ToHex(amountUin8))
      const privatekey = Convert.uint8ToHex(pkUin8)
      const des = this.hexToString(Convert.uint8ToHex(desUin8))
      return { amount, privatekey, des }
    } catch (error) {
      console.error('error', error)
    }
  }

  serializeData(amount, pk, des) {
    console.debug('amount', amount)
    console.debug('pk', pk)
    console.debug('des', des)
    const ammountUin64 = UInt64.fromUint(amount)
    const amountUin8 = Convert.hexToUint8(ammountUin64.toHex())
    const pkUin8 = Convert.hexToUint8(pk)
    const desUin8 = Convert.hexToUint8(Convert.utf8ToHex(Convert.rstr2utf8(des)))
    console.debug('HEX:', this.concatUniArray(amountUin8, pkUin8, desUin8))
    return this.concatUniArray(amountUin8, pkUin8, desUin8)
  }
  concatUniArray(buffer1, buffer2, buffer3) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength + buffer3.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    tmp.set(new Uint8Array(buffer3), buffer1.byteLength + buffer2.byteLength);
    return Convert.uint8ToHex(tmp);
  }
  hexToString(hex) {
    var string = '';
    for (var i = 0; i < hex.length; i += 2) {
      string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return string;
  }
}
export interface DataDececode {
  amount: UInt64,
  privatekey: string
  des: string

}
export interface RecipientData {
  publicAccount: PublicAccount;
  name: string;
}