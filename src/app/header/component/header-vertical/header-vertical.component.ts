import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header-vertical',
  templateUrl: './header-vertical.component.html',
  styleUrls: ['./header-vertical.component.scss']
})
export class HeaderVerticalComponent implements OnInit {
  keyObject = Object.keys;
  @Input() header: object;
  @Input() showMenu: boolean;
<<<<<<< HEAD
  @Output() logout: EventEmitter<any> = new EventEmitter();
=======
  @Output() selectNetwork = new EventEmitter();

>>>>>>> 9b3df55775f4f1e5b2f3ddb5749c9b5e6d8356e6
  constructor() { }

  ngOnInit() {
  }
<<<<<<< HEAD
  logoutEvent(param){

    this.logout.emit(param);

  }

=======
>>>>>>> 9b3df55775f4f1e5b2f3ddb5749c9b5e6d8356e6
}
