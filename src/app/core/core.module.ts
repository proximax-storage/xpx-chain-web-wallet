import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticlesModule } from 'angular-particle';
import { MaterialModule } from '../shared/modules/material.module';

const modules = [
  CommonModule,
  MaterialModule,
  ParticlesModule
];

@NgModule({
  imports: [
    modules
  ],
  exports: [
    modules
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule
    };
  }
}
