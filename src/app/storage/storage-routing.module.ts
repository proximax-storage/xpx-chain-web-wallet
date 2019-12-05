import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { UploadFileComponent } from './views/upload-file/upload-file.component';
import { MyFileComponent } from './views/my-file/my-file.component';

const routes: Routes = [
  {
    path: AppConfig.routes.uploadFile,
    component: UploadFileComponent,
    data: {
      meta: {
        title: 'uploadFile.title',
        description: 'uploadFile.text',
        override: true,
      }
    }
  }, {
    path: AppConfig.routes.myFile,
    component: MyFileComponent,
    data: {
      meta: {
        title: 'myFile.title',
        description: 'myFile.text',
        override: true,
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StorageRoutingModule { }
