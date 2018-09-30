import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';
import { MDBSpinningPreloader, MDBBootstrapModulesPro } from 'ng-uikit-pro-standard';

@NgModule({
  imports: [
    CommonModule,
    MDBBootstrapModulesPro.forRoot(),
    AgmCoreModule.forRoot({
      // https://developers.google.com/maps/documentation/javascript/get-api-key?hl=en#key
      apiKey: 'Your_api_key'
    })
  ],
  exports: [
    CommonModule,
    MDBBootstrapModulesPro,
    AgmCoreModule
  ]
})
export class MdbModule {

  constructor() {
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdbModule,
      providers: [ MDBSpinningPreloader ]
    };
  }
}
