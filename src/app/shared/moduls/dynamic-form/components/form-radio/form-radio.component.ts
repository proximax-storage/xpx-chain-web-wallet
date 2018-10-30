import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'form-radio',
  styleUrls: ['form-radio.component.css'],
  template: `
    <div class="dynamic-field form-radio" [formGroup]="group">
        <ng-container *ngFor="let opt of objkeys(config.options)">
          <div class="form-check form-check-inline">
            <input value="dwewe" type="radio" class="form-check-input" [id]="config.name" [name]="config.name" mdbInputDirective>
            <label class="form-check-label" [for]="config.name">{{opt}}</label>
          </div>
        </ng-container>
    </div>
  `,
})
export class FormRadioComponent {
  config;
  group: FormGroup;
  objkeys = Object.keys;
}
