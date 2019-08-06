import { NgModule } from '@angular/core';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './views/auth/auth.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [AuthComponent],
  imports: [
    CoreModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
