import { Transaction, PublicAccount, Address } from 'tsjs-xpx-catapult-sdk';

export interface TransactionsInterface {
  data: Transaction;
  nameType: string;
  timestamp: string;
  fee: string;
  sender: PublicAccount;
  recipientRentalFeeSink: string;
  recipient: Address;
  isRemitent: boolean;
}


export interface MosaicXPXInterface {
  mosaic: "prx.xpx",
  mosaicId: "0dc67fbe1cad29e3",
  divisibility: 6
}
