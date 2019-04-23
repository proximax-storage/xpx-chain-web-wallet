import { NgModule, ModuleWithProviders, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticlesModule } from 'angular-particle';
import { ReactiveFormsModule } from '@angular/forms';
import { MdbModule } from "../shared/moduls/mdb/mdb.module";
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ClipboardModule } from 'ngx-clipboard';
import { TransactionsComponent } from "../transactions/views/transactions/transactions.component";
import { ReversePipePipe } from '../shared/pipe/reverse-pipe.pipe'
import { DynamicFormModule } from '../shared/moduls/dynamic-form/dynamic-form.module';


const modules = [
  CommonModule,
  ParticlesModule,
  ReactiveFormsModule,
  FormsModule,
  HttpClientModule,
  DynamicFormModule,
  ClipboardModule
];

@NgModule({
  imports: [
    modules,
    MdbModule.forRoot()
  ],
  declarations: [
    TransactionsComponent,
    ReversePipePipe
  ],
  exports: [
    TransactionsComponent,
    modules,
    MdbModule,
    ReversePipePipe
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule
    };
  }
}
