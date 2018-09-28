import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-header-vertical',
  templateUrl: './header-vertical.component.html',
  styleUrls: ['./header-vertical.component.scss']
})
export class HeaderVerticalComponent implements OnInit {
  keyObject = Object.keys;
  @Input() header: object;
  @Input() showMenu: boolean;
  constructor() { }

  ngOnInit() {
  }

}
