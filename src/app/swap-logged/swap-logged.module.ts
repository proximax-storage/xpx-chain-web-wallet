import { NgModule } from '@angular/core';

import { SwapLoggedRoutingModule } from './swap-logged-routing.module';
import { SwapModule } from '../swap/swap.module';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [],
  imports: [
    CoreModule,
    SwapModule,
    SwapLoggedRoutingModule
  ]
})
export class SwapLoggedModule { }
