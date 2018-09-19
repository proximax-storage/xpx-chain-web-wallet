import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticlesModule } from 'angular-particle';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/modules/material.module';

const modules = [
  CommonModule,
  MaterialModule,
  ParticlesModule,
  FlexLayoutModule,
  ReactiveFormsModule
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
