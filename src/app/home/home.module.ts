import { NgModule } from '@angular/core';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './views/home/home.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  imports: [
    CoreModule,
    HomeRoutingModule
  ],
  declarations: [HomeComponent]
})
export class HomeModule { }
