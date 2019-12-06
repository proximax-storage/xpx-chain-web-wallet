import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { StorageRoutingModule } from './storage-routing.module';
import { CoreModule } from '../core/core.module';
import { UploadFileComponent } from './views/upload-file/upload-file.component';
import { MyFileComponent } from './views/my-file/my-file.component';

@NgModule({
  declarations: [
    UploadFileComponent,
    MyFileComponent
  ],
  schemas: [NO_ERRORS_SCHEMA],
  imports: [
    CoreModule,
    StorageRoutingModule
  ]
})
export class StorageModule { }
