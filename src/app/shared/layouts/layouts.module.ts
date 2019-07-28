import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CoreModule } from '../../core/core.module';
import { SidebarAuthComponent } from './headers/sidebar-auth/sidebar-auth.component';
import { WrapperAuthComponent } from './wrappers/wrapper-auth/wrapper-auth.component';


const components = [
  SidebarAuthComponent,
  WrapperAuthComponent
];

@NgModule({
  imports: [
    CoreModule,
    RouterModule
  ],
  declarations: [
    components
  ],
  exports: [
    components
  ]
})
export class LayoutsModule { }
