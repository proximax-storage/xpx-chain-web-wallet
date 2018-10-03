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
  @Output() selectNetwork = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }
}
