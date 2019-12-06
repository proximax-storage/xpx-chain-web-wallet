import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { CreateNamespaceComponent } from './views/create-namespace/create-namespace.component';
import { ExtendDurationNamespaceComponent } from './views/extend-duration-namespace/extend-duration-namespace.component';

const routes: Routes = [
  {
    path: AppConfig.routes.createNamespace,
    component: CreateNamespaceComponent,
    data: {
      meta: {
        title: 'createNamespace.title',
        description: 'createNamespace.text',
        override: true,
      }
    }
  }, {
    path: AppConfig.routes.renewNamespace,
    component: ExtendDurationNamespaceComponent,
    data: {
      meta: {
        title: 'renewNamespace.title',
        description: 'renewNamespace.text',
        override: true,
      }
    }
  }, {
    path: AppConfig.routes.extendNamespace,
    component: ExtendDurationNamespaceComponent,
    data: {
      meta: {
        title: 'extendNamespace.title',
        description: 'extendNamespace.text',
        override: true,
      }
    }
  },
  {
    path: `${AppConfig.routes.extendNamespace}/:id`,
    component: ExtendDurationNamespaceComponent,
    data: {
      meta: {
        title: 'extendNamespace.title',
        description: 'extendNamespace.text',
        override: true,
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NamespaceRoutingModule { }
