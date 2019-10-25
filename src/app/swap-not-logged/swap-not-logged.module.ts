import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SwapNotLoggedRoutingModule } from './swap-not-logged-routing.module';
import { CoreModule } from '../core/core.module';
import { SwapModule } from '../swap/swap.module';

@NgModule({
  declarations: [],
  imports: [
    SwapModule,
    CoreModule,
    SwapNotLoggedRoutingModule
  ]
})
export class SwapNotLoggedModule { }
