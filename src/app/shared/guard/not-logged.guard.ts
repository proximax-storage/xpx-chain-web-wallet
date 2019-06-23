import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { AppConfig } from '../../config/app.config';

@Injectable({
    providedIn: 'root'
})
export class NotLoggedGuard implements CanActivate {

    constructor(private authService: AuthService, private route: Router) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.authService.logged) {
            this.route.navigate([`/${AppConfig.routes.dashboard}`]);
            return false;
        }
        return true;
    }
}
