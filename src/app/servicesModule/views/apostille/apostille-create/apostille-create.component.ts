import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-apostille-create',
  templateUrl: './apostille-create.component.html',
  styleUrls: ['./apostille-create.component.scss']
})
export class ApostilleCreateComponent implements OnInit {

  apostilleCreateForm: FormGroup;
  configurationForm = {
    documentTitle: {
      minLength: 1,
      maxLength: 64
    },
    content: {
      minLength: 0,
      maxLength: 240
    },
    tags: {
      minLength: 1,
      maxLength: 240
    },
    password: {
      minLength: 8,
      maxLength: 64
    }
  }

  typeEncrypted: Array<object> = [
    {
      value: '1',
      label: 'MD5',
      selected: false,
      disabled: false
    },
    {
      value: '2',
      label: 'SHA1',
      selected: false,
      disabled: false
    },
    {
      value: '3',
      label: 'SHA256',
      selected: false,
      disabled: false
    },
    {
      value: '4',
      label: 'SHA3-256',
      selected: false,
      disabled: false
    }
  ];

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.createForm();
  }

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
      safeDFMS: [''],
      typePrivatePublic: [false, [
        Validators.required
      ]],
      tags: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.content.minLength),
        Validators.maxLength(this.configurationForm.content.maxLength)
      ]],
      typeEncrypted: ['', [
        Validators.required
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.documentTitle.minLength),
        Validators.maxLength(this.configurationForm.documentTitle.maxLength)
      ]],
    });
  }

  optionSelected(typeEncrypted: any) {
    console.log(typeEncrypted);
  }

}
