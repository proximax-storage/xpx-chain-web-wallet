import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-wallet-created',
  templateUrl: './wallet-created.component.html',
  styleUrls: ['./wallet-created.component.css']
})
export class WalletCreatedComponent implements OnInit {

  title = 'Congratulations!';
  titleDescription = 'Your wallet has been created successfully';
  subtitle = 'Wallet Name';
  description = 'Warning! before proceeding, make sure store your private key in a safe place. Access to your digital assets cannot be recovered without it.';
  address = 'VDM4JY-23P2UH-KGK7D7-PFOHQP-NNGPTW-H7NAI2-B6IH';
  publicKey = '9113667FD2FEEC262B7A2E5A90B3C6A47540CBCBA0B4152CF4A5F59E7214C86F';
  privateKey = 'A3FF48A80508238BADAD6692C7DA4A5CDEC35DC8ABDF96012B67C9312DC9837F';

  constructor() { }

  ngOnInit() {
  }

}
