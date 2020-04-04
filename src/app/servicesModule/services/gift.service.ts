import { Injectable } from '@angular/core';
import { Convert, UInt64, PublicAccount } from 'tsjs-xpx-chain-sdk';
import * as jsPDF from 'jspdf';
@Injectable({
  providedIn: 'root'
})
export class GiftService {
  typeDonwnload: string = ''
  imgFileData: any = null
  pdfFileData: any = null
  zipFileData: any = []
  constructor() { }


  get getTypeDonwnload(): string {
    return this.typeDonwnload;
  }
  set setTypeDonwnload(val: string) {
    this.typeDonwnload = val;
  }

  get getImgFileData(): any {
    return this.imgFileData;
  }
  set setImgFileData(val: any) {
    this.imgFileData = val;
  }
  get getPdfFileData(): any {
    return this.pdfFileData;
  }
  set setPdfFileData(val: any) {
    this.pdfFileData = val;
  }

  get getZipFileData(): any {
    return this.zipFileData;
  }
  set setZipFileData(val: any) {
    this.zipFileData = val;
  }
  pdfFromImg(imgBase64: string) {
    var doc = new jsPDF();
    doc.addImage(imgBase64, 'JPEG', 0, 0, 210, 300)
    return doc.output('blob');
  }

  unSerialize(hex): DataDececode {
    try {
      const dataUin8 = Convert.hexToUint8(hex)
      const amountUin8 = new Uint8Array(8)
      let amountUin32 = new Uint32Array(2)
      const pkUin8 = new Uint8Array(32)
      const mosaicId = new Uint8Array(8)
      const typeUin8 = new Uint8Array(1)
      const codeUin8 = new Uint8Array(20)
      amountUin8.set(new Uint8Array(dataUin8.subarray(0, 8)), 0)
      pkUin8.set(new Uint8Array(dataUin8.subarray(8, 40)), 0)
      mosaicId.set(new Uint8Array(dataUin8.subarray(40, 48)), 0)
      typeUin8.set(new Uint8Array(dataUin8.subarray(48, 49)), 0)
      codeUin8.set(new Uint8Array(dataUin8.subarray(49, dataUin8.byteLength)), 0)
      amountUin32 = Convert.uint8ToUint32(amountUin8)
      const amount = UInt64.fromHex(Convert.uint8ToHex(amountUin8))
      const privatekey = Convert.uint8ToHex(pkUin8)
      const mosac = Convert.uint8ToHex(mosaicId)
      const type = this.hexToString(Convert.uint8ToHex(typeUin8))
      const codeCard = this.hexToString(Convert.uint8ToHex(codeUin8))

      return { amount, privatekey, mosac, type, codeCard }
    } catch (error) {
      console.error('error', error)
    }
  }

  serializeData(amount, pk, mosaic, type, des) {
    const ammountUin64 = UInt64.fromUint(amount)
    const amountUin8 = Convert.hexToUint8(ammountUin64.toHex())
    const pkUin8 = Convert.hexToUint8(pk)
    const mosaicId = Convert.hexToUint8(mosaic)
    const typeUin8 = Convert.hexToUint8(Convert.utf8ToHex(Convert.rstr2utf8(type)))
    const codeUin8 = Convert.hexToUint8(Convert.utf8ToHex(Convert.rstr2utf8(des)))
    return this.concatUniArray(amountUin8, pkUin8, mosaicId, typeUin8, codeUin8)
  }
  concatUniArray(buffer1, buffer2, buffer3, buffer4, buffer5) {
    const  tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength + buffer3.byteLength + buffer4.byteLength + buffer5.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    tmp.set(new Uint8Array(buffer3), buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer4), buffer1.byteLength + buffer2.byteLength + buffer3.byteLength);
    tmp.set(new Uint8Array(buffer5), buffer1.byteLength + buffer2.byteLength + buffer3.byteLength + buffer4.byteLength);
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
  mosac: string,
  type: string,
  codeCard: string,

}
export interface RecipientData {
  publicAccount: PublicAccount;
  name: string;
}