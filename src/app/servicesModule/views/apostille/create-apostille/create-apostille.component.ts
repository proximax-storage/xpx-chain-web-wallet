import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ConfigurationForm } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-create-apostille',
  templateUrl: './create-apostille.component.html',
  styleUrls: ['./create-apostille.component.css']
})
export class CreateApostilleComponent implements OnInit {


  apostilleCreateForm: FormGroup;
  configurationForm: ConfigurationForm;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
  }


  /**
   *
   *
   * @memberof CreateApostilleComponent
   */
  createForm() {
    this.apostilleCreateForm = this.fb.group({
      documentTitle: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.documentTitle.minLength),
        Validators.maxLength(this.configurationForm.documentTitle.maxLength)
      ]],

      content: ['', [
        Validators.minLength(this.configurationForm.content.minLength),
        Validators.maxLength(this.configurationForm.content.maxLength)
      ]],

      file: [''],

      safeDFMS: [''],

      typePrivatePublic: [true, [
        Validators.required
      ]],

      tags: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.content.minLength),
        Validators.maxLength(this.configurationForm.content.maxLength)
      ]],

      typeEncrypted: ['3', [
        Validators.required
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.documentTitle.minLength),
        Validators.maxLength(this.configurationForm.documentTitle.maxLength)
      ]],
    });
  }

  send() {
    console.log('SEND ....');

  }

}
