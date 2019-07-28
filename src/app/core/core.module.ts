import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdbModule } from '../shared/moduls/mdb/mdb.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const moduls = [
  NgSelectModule,
  ReactiveFormsModule,
  FormsModule
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    moduls,
    MdbModule.forRoot()
  ],
  exports: [
    MdbModule,
    moduls
  ]
})
export class CoreModule { }
