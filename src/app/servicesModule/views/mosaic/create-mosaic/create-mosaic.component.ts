import { Component, OnInit } from '@angular/core';
// import { ConfigurationForm, SharedService } from '../../../../shared/services/shared.service';
import { FormBuilder, Validators, AbstractControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-mosaic',
  templateUrl: './create-mosaic.component.html',
  styleUrls: ['./create-mosaic.component.css']
})
export class CreateMosaicComponent implements OnInit {
  // configurationForm: ConfigurationForm = {};
  moduleName = 'Mosaics';
  componentName = 'Create';
  mosaicsForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    // private sharedService: SharedService,
  ) { }

  ngOnInit() {
    // this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
  }

    /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  createForm() {
    this.mosaicsForm = this.fb.group({
      duration: ['', [Validators.required]],
      supply: ['', [Validators.required]],
      transferable: ['', [Validators.required]],
      supplyMutable: ['', [Validators.required]],
      levyMutable: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }



  createMosaic() {
console.log('mosaics-> create')
  }


   /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof CreateNamespaceComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.mosaicsForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.mosaicsForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.mosaicsForm.get(nameInput);
    }
    return validation;
  }

  /**
   *
   *
   * @param {(string | (string | number)[])} control
   * @returns
   * @memberof CreateNamespaceComponent
   */
  getInput(control: string | (string | number)[]) {
    return this.mosaicsForm.get(control);
  }

}
