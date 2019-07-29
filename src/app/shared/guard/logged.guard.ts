import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { AppConfig } from '../../config/app.config';

@Injectable({
  providedIn: 'root'
})
export class LoggedGuard implements CanActivate {

  constructor(
    private _authService: AuthService,
    private route: Router
  ) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    console.log(this._authService.isLogged);
    if (this._authService.isLogged) {
      return true;
    }

    console.log('no puedes...');
    this.route.navigate([`/${AppConfig.routes.auth}`]);
    return false;
  }
}
