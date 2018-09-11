import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticlesModule } from 'angular-particle';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../shared/modules/material.module';

const modules = [
  CommonModule,
  MaterialModule,
  ParticlesModule,
  FlexLayoutModule
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
