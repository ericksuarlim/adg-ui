import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ShowLogin implements CanActivate {

    constructor(
        private router: Router
    ) { }

    canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const isLogin = localStorage.getItem('user_name') != null;
        if (!isLogin) {
            return true;
        } else {
            this.router.navigate(['/home']);
            return false;
        }
    }

}
