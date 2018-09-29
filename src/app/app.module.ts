// Modules
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CoreModule } from './core/core.module';
// Routing
import { routing, appRoutingProviders } from './app.routing';
//components
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { ToastModule } from 'ng-uikit-pro-standard';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    routing,
    CoreModule.forRoot(),
    ToastModule.forRoot({
      preventDuplicates: true,
      autoDismiss: true,
      progressBar: true
    })
  ],
  providers: [appRoutingProviders],
  bootstrap: [AppComponent],
  schemas: [ NO_ERRORS_SCHEMA ]
  
})
export class AppModule { }
