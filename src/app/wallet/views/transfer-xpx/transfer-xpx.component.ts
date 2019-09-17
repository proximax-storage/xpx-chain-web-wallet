import { Component, OnInit } from '@angular/core';
import { AppConfig } from 'src/app/config/app.config';

@Component({
  selector: 'app-transfer-xpx',
  templateUrl: './transfer-xpx.component.html',
  styleUrls: ['./transfer-xpx.component.css']
})
export class TransferXpxComponent implements OnInit {

  showCertificate: boolean = false;
  transactionSuccess: any;
  routeCertificate: string = `/${AppConfig.routes.auth}`;
  title: string = 'Mainnet Swap';
  subtitle: string = null;
  constructor() { }

  ngOnInit() {
  }
  
  viewCertificate(event): void {
    this.title = 'Congratulations!';
    this.subtitle = 'The swap process has already started.';
    this.showCertificate = !this.showCertificate;
    this.transactionSuccess = event;
    console.log("this.transactionSuccess", this.transactionSuccess);
  }

}
