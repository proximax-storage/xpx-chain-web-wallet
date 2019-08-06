import { ModuleWithProviders, NgModule } from '@angular/core';


import { LayoutsModule } from './layouts/layouts.module';
import { CoreModule } from '../core/core.module';
@NgModule({
  exports: [LayoutsModule],
  providers: [],
  declarations: [],
  imports: [
    CoreModule
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return { ngModule: SharedModule };
  }
}
