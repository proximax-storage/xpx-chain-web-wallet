import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { SharedService, ConfigurationForm } from '../../../../shared/services/shared.service';
import { AppConfig } from '../../../../config/app.config';

@Component({
  selector: 'app-mosaics-supply-change',
  templateUrl: './mosaics-supply-change.component.html',
  styleUrls: ['./mosaics-supply-change.component.css']
})
export class MosaicsSupplyChangeComponent implements OnInit {
  moduleName = 'Mosaics';
  componentName = 'Change Supply';
  backToService = `/${AppConfig.routes.service}`;
  supplyForm: FormGroup;
  configurationForm: ConfigurationForm = {};
  arrayselect: Array<object> = [
    {
      value: '1',
      label: 'New root Namespace',
      selected: true,
      disabled: false
    }
  ];

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
  ) { }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
  }


    /**
   * Create form namespace
   *
   * @memberof MosaicsSupplyChangeComponent
   */
  createForm() {
    this.supplyForm = this.fb.group({
      mosaic: [1],
      increordecre: [1],
      amount: [1000000, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });
  }

  send() {
console.log('envio')
  }

  clearForm() {
    this.supplyForm.get('mosaic').patchValue(1);
    this.supplyForm.get('increordecre').patchValue(1);
    this.supplyForm.get('amount').patchValue(1000000);
    this.supplyForm.get('password').patchValue('');
  }

  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.supplyForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.supplyForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.supplyForm.get(nameInput);
    }
    return validation;
  }
}
