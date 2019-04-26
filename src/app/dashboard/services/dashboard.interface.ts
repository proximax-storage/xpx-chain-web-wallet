import { Transaction } from 'proximax-nem2-sdk';

export interface TransactionsInterface {
  data: Transaction;
  nameType: string;
  timestamp: string;
  fee: string;
  sender: string;
  recipientRentalFeeSink: string;
  recipient: string;
  isRemitent: boolean;
}
