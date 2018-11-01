// Modules
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CoreModule } from './core/core.module';
import { ToastModule } from 'ng-uikit-pro-standard';
import { BlockUIModule } from 'ng-block-ui';
// Routing
import { routing, appRoutingProviders } from './app.routing';
// components
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HeaderHorizontalComponent } from './header/component/header-horizontal/header-horizontal.component';

import { HeaderRebSocialComponent } from './header/component/header-reb-social/header-reb-social.component';
import { HeaderVerticalComponent } from './header/component/header-vertical/header-vertical.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HeaderHorizontalComponent,
    HeaderRebSocialComponent,
    HeaderVerticalComponent
  ],
  imports: [
    
    BrowserModule,
    BrowserAnimationsModule,
    routing,
    CoreModule.forRoot(),
    BlockUIModule.forRoot(),
    ToastModule.forRoot({
      maxOpened: 1,
      newestOnTop: false,
      preventDuplicates: true,
      autoDismiss: true,
      progressBar: true
    })
  ],
  providers: [appRoutingProviders],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
