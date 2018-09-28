import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-header-horizontal',
  templateUrl: './header-horizontal.component.html',
  styleUrls: ['./header-horizontal.component.scss']
})
export class HeaderHorizontalComponent implements OnInit {
  keyObject = Object.keys;
  @Input() header: object;
  @Input() showMenu: boolean;
  constructor() { }

  ngOnInit() {
  }

}
