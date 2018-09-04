import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatMenuModule,
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatSidenavModule,
  MatToolbarModule
} from '@angular/material';

const imports = [
  MatMenuModule,
  MatButtonModule,
  MatToolbarModule,
  MatIconModule,
  MatListModule,
  MatSidenavModule

];
const declarations = [

];

@NgModule({
  imports: [
    CommonModule,
    imports
  ],
  declarations: [],
  exports: [
    imports
  ]
})
export class MaterialAngularModule { }
