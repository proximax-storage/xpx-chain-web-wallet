import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticlesModule } from 'angular-particle';
import { ReactiveFormsModule } from '@angular/forms';

const modules = [
  CommonModule,
  ParticlesModule,
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
