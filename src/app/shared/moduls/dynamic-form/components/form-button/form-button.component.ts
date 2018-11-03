import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'form-button',
  styleUrls: ['form-button.component.css'],
  template: `
    <div
      class="dynamic-field form-button"
      [formGroup]="group">
      <button type="submit">
        {{ config.label }}
      </button>
    </div>
  `,
})
export class FormButtonComponent {
  config;
  group: FormGroup;
}
