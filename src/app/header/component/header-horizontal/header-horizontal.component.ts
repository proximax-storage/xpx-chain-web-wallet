import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header-horizontal',
  templateUrl: './header-horizontal.component.html',
  styleUrls: ['./header-horizontal.component.scss']
})
export class HeaderHorizontalComponent implements OnInit {
  keyObject = Object.keys;
  @Input() header: object;
  @Input() showMenu: boolean;
  @Output() logout: EventEmitter<any> = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }
  logoutEvent(param){
    this.logout.emit(param);

  }


}
