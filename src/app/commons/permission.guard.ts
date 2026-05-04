import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Permission, hasPermission } from '../constants/permissions';
import { AuthenticationServiceService } from '../services/authentication-service.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly authenticationService: AuthenticationServiceService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const requiredPermissions = (route.data['permissions'] ?? []) as Permission[];
    if (requiredPermissions.length === 0) {
      return true;
    }

    const roles = this.authenticationService.getRoles();
    const canAccess = requiredPermissions.every((permission) => hasPermission(roles, permission));
    if (canAccess) {
      return true;
    }

    return this.router.parseUrl('/home');
  }
}
