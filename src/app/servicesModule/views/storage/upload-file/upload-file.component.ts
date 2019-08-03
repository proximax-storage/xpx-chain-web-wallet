import { Component, OnInit } from '@angular/core';
import { AppConfig } from 'src/app/config/app.config';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  moduleName = 'Storage';
  componentName = 'Upload File';
  backToService = `/${AppConfig.routes.service}`;
  configurationForm: ConfigurationForm = {};
  uploadFileForm: FormGroup;
  blockUpload: boolean = false;

   constructor(
    private fb: FormBuilder,
    private router: Router,
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService,
    private dataBridge: DataBridgeService
  ) { }


  ngOnInit() {
  }

}
