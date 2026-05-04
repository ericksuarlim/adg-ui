import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationServiceService } from '../services/authentication-service.service';

@Injectable({
    providedIn: 'root'
})
export class ShowLogin implements CanActivate {

    constructor(
        private readonly router: Router,
        private readonly authenticationService: AuthenticationServiceService
    ) { }

    canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const isLoggedIn = this.authenticationService.isAuthenticated();
        if (!isLoggedIn) {
            return true;
        }

        this.router.navigate(['/home']);
        return false;
    }

}
