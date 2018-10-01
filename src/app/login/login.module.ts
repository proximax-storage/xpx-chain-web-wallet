import { NgModule ,NO_ERRORS_SCHEMA} from '@angular/core';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './views/login/login.component';
import { CoreModule } from '../core/core.module';



const declarations = [
  LoginComponent
]

const imports = [
  CoreModule,
  LoginRoutingModule,
  
]

@NgModule({
  imports: [
    imports
  ],
  declarations: [
    declarations,
  
  ],
  schemas: [NO_ERRORS_SCHEMA] 
})
export class LoginModule { }
