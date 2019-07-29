import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ClipboardModule } from 'ngx-clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';

import { MdbModule } from '../shared/moduls/mdb/mdb.module';

const moduls = [
  NgSelectModule,
  ReactiveFormsModule,
  FormsModule,
  ClipboardModule
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    moduls,
    NgxMaskModule.forRoot(),
    MdbModule.forRoot(),
  ],
  exports: [
    MdbModule,
    NgxMaskModule,
    moduls
  ]
})
export class CoreModule { }
