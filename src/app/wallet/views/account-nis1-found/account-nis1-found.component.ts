import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfig } from '../../../config/app.config';

@Component({
  selector: 'app-account-nis1-found',
  templateUrl: './account-nis1-found.component.html',
  styleUrls: ['./account-nis1-found.component.css']
})
export class AccountNis1FoundComponent implements OnInit {

  privateKey: string;
  goSignIn: string = `/${AppConfig.routes.auth}`;
  constructor(
    private activateRoute: ActivatedRoute,
    private router: Router
  ) {
    if (this.activateRoute.snapshot.paramMap.get('privateKey')) {
      this.privateKey = this.activateRoute.snapshot.paramMap.get('privateKey').toUpperCase();
    } else {
      this.router.navigate([`/${AppConfig.routes.home}`]);
    }
  }

  ngOnInit() {
  }

  goToRoute() {
    this.router.navigate([`/${AppConfig.routes.transferXpx}`]);
  }

}
