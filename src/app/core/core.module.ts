import { NgModule, ModuleWithProviders, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticlesModule } from 'angular-particle';
import { ReactiveFormsModule } from '@angular/forms';
import { MdbModule } from "../shared/moduls/mdb/mdb.module";
import { FormsModule } from '@angular/forms';

const modules = [
  CommonModule,
  ParticlesModule,
  ReactiveFormsModule,
  FormsModule
];

@NgModule({
  imports: [
    modules,
    MdbModule.forRoot()
  ],
  exports: [
    modules,
    MdbModule
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule
    };
  }
}
