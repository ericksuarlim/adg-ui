import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from 'src/app/commons/autentication.guard';
import { PermissionGuard } from 'src/app/commons/permission.guard';
import { Permission } from 'src/app/constants/permissions';
import { SaasManagementComponent } from './saas-management.component';

const routes: Routes = [
  {
    path: '',
    component: SaasManagementComponent,
    canActivate: [AutenticacionGuard, PermissionGuard],
    data: {
      permissions: [Permission.COMPANY_READ, Permission.USER_READ]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SaasManagementRoutingModule {}
