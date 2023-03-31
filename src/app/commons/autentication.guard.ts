import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionGuard implements CanActivate {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isLogin = localStorage.getItem('user_name')!=null;
    if(isLogin){ 
      return true;
    }else{
      this.router.navigate(['/login']);
      return false;
    }
    
  }

}
