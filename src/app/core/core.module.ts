import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdbModule } from '../shared/moduls/mdb/mdb.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

const moduls = [
  MdbModule.forRoot(),
  NgSelectModule,
  FormsModule
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    moduls
  ],
  exports: [
    MdbModule,
    NgSelectModule,
    FormsModule
  ]
})
export class CoreModule { }
