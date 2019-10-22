import { NgModule } from '@angular/core';

import { SwapLoggedRoutingModule } from './swap-logged-routing.module';
import { SwapModule } from '../swap/swap.module';

@NgModule({
  declarations: [],
  imports: [
    SwapModule,
    SwapLoggedRoutingModule
  ]
})
export class SwapLoggedModule { }
