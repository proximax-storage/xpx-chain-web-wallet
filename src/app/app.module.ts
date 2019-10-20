import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { ToastModule } from 'ng-uikit-pro-standard';
import { HttpClientModule } from '@angular/common/http';


import { routing, appRoutingProviders } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    routing,
    CoreModule,
    SharedModule.forRoot(),
    HttpClientModule,
    ToastModule.forRoot({
      maxOpened: 1,
      newestOnTop: true,
      preventDuplicates: true,
      autoDismiss: true,
      progressBar: false
    })
  ],
  providers: [appRoutingProviders],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
