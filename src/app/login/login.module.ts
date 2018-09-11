import { NgModule } from '@angular/core';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './views/login/login.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  imports: [
    CoreModule,
    LoginRoutingModule
  ],
  declarations: [LoginComponent]
})
export class LoginModule { }
