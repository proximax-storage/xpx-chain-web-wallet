import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../../login/services/login.service';
import { first } from 'rxjs/operators';
import { AppConfig } from '../../config/app.config';

@Injectable({
    providedIn: 'root'
})
export class NotLoggedGuard implements CanActivate {

    constructor(private _loginService: LoginService, private route: Router) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this._loginService.logged) {
            this.route.navigate([`/${AppConfig.routes.dashboard}`]);
            return false;
        }
        return true;
    }
}
