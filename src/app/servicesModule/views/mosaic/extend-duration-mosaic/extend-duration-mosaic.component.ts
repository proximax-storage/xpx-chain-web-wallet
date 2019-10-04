import { Component, OnInit } from '@angular/core';

import { HeaderServicesInterface } from '../../../services/services-module.service';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { MosaicService } from 'src/app/servicesModule/services/mosaic.service';

@Component({
  selector: 'app-extend-duration-mosaic',
  templateUrl: './extend-duration-mosaic.component.html',
  styleUrls: ['./extend-duration-mosaic.component.css']
})
export class ExtendDurationMosaicComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Mosaics',
    componentName: 'Extend Duration'
  };
  parentMosaic: any = [{
    value: '1',
    label: 'Select or enter here',
    selected: false,
    disabled: true
  }];
  subscribe = ['block'];
  currentBlock: number = 0;
  configurationForm: ConfigurationForm = {};
  extendDurationMosaicsForm: FormGroup;
  excedDuration: boolean;
  calculateRentalFee: string = '0.000000';
  fee: string = '0.000000';


  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private mosaicService: MosaicService,
    private dataBridge: DataBridgeService
  ) { }

  async ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    this.subscribe['block'] = this.dataBridge.getBlock().subscribe(next => this.currentBlock = next);
    const data = await this.mosaicService.filterMosaics();

    console.log('block', this.subscribe['block']);
    console.log('data', data);
    
  }


  createForm() {
    // Form Renew Namespace
    this.extendDurationMosaicsForm = this.fb.group({
      mosaics: ['', [Validators.required]],
      duration: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]],
    });
  }

  extendDuration(){

  }

  limitDuration(e) {
    if (isNaN(parseInt(e.target.value))) {
      e.target.value = ''
    } else {
      if (parseInt(e.target.value) > 365) {
        // e.target.value = '365'
        this.excedDuration = true;
      } else if (parseInt(e.target.value) < 1) {
        e.target.value = ''
      }
    }
  }
  
  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof ExtendDurationNamespaceComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.extendDurationMosaicsForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.extendDurationMosaicsForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.extendDurationMosaicsForm.get(nameInput);
    }
    return validation;
  }

}
