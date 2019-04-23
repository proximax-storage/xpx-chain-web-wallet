import { NgModule ,NO_ERRORS_SCHEMA} from '@angular/core';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './views/auth/auth.component';
import { CoreModule } from '../core/core.module';



const declarations = [
  AuthComponent
]

const imports = [
  CoreModule,
  AuthRoutingModule,

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
export class AuthModule { }
