import { Component, OnInit } from '@angular/core';
import { HeaderServicesInterface } from 'src/app/servicesModule/services/services-module.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-blockchain',
  templateUrl: './blockchain.component.html',
  styleUrls: ['./blockchain.component.css']
})
export class BlockchainComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Nodes',
    componentName: 'Blockchain'
  };
  arrayselect: Array<object> = [{
    value: '',
    label: 'Select node',
    selected: true,
    disabled: false
  }];
  nodeForm: FormGroup;
  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.createForm();
  }


  createForm() {
    //Form namespace default
    this.nodeForm = this.fb.group({
      nodeSelect: [''],

      customNode: ['', [
        Validators.minLength(6),
        Validators.maxLength(10)
      ]],

    });
  }

  change(){
console.log('change node');

  }
}
