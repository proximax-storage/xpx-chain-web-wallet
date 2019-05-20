import { NgModule, ModuleWithProviders, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticlesModule } from 'angular-particle';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ClipboardModule } from 'ngx-clipboard';
import { MdbModule } from "../shared/moduls/mdb/mdb.module";


const modules = [
  CommonModule,
  ParticlesModule,
  ReactiveFormsModule,
  FormsModule,
  HttpClientModule,
  ClipboardModule
];

@NgModule({
  imports: [
    modules,
    MdbModule.forRoot()
  ],
  declarations: [
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
