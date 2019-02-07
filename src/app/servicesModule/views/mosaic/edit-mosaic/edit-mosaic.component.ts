import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AccountInfo, QueryParams, NamespaceName } from 'proximax-nem2-sdk';
import { NemProvider } from '../../../../shared/services/nem.provider';
import { WalletService } from '../../../../shared/services/wallet.service';
import { MosaicService } from '../../../services/mosaic.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { AppConfig } from '../../../../config/app.config';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-edit-mosaic',
  templateUrl: './edit-mosaic.component.html',
  styleUrls: ['./edit-mosaic.component.scss']
})
export class EditMosaicComponent implements OnInit {
  
  /**
   * Initialize dependencies and properties
   *
   * @params {services, dependencies} - Angular services to inject
   */
  constructor(
  ) { }

  ngOnInit() {
  }


}
