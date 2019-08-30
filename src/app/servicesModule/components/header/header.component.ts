import { Component, OnInit, Input } from '@angular/core';
import { AppConfig } from '../../../config/app.config';
import { HeaderServicesInterface } from '../../services/services-module.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() params: HeaderServicesInterface;
  goBack: string = `/${AppConfig.routes.service}`;
  constructor() { }

  ngOnInit() {
    if (this.params.routerBack) {
      this.goBack = this.params.routerBack;
    }
  }

}
