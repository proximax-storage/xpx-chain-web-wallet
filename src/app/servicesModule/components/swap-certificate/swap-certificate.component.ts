import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-swap-certificate',
  templateUrl: './swap-certificate.component.html',
  styleUrls: ['./swap-certificate.component.css']
})
export class SwapCertificateComponent implements OnInit {

  @Input() route: string;
  @Input() params: any;

  constructor() { }

  ngOnInit() {
    console.log('\n\n\n\nValue route:\n', this.route, '\n\n\n\nEnd value\n\n');
    console.log('\n\n\n\nValue params:\n', this.params, '\n\n\n\nEnd value\n\n');
  }

}
