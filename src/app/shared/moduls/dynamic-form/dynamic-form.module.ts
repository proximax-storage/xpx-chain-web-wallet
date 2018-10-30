import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { DynamicFormComponent } from './containers/dynamic-form/dynamic-form.component';
import { FormInputComponent } from "./components/form-input/form-input.component";
import { FormButtonComponent } from "./components/form-button/form-button.component";
import { FormSelectComponent } from "./components/form-select/form-select.component";
import { DynamicFieldDirective } from './components/dynamic-field/dynamic-field.directive';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [
    DynamicFieldDirective,
    DynamicFormComponent,
    FormInputComponent,
    FormButtonComponent,
    FormSelectComponent
  ],
  exports: [
    DynamicFormComponent
  ],
  entryComponents: [
    FormButtonComponent,
    FormInputComponent,
    FormSelectComponent,
  ]
})
export class DynamicFormModule { }
