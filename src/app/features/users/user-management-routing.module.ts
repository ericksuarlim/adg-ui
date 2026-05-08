import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from 'src/app/core/guards/autentication.guard';
import { PermissionGuard } from 'src/app/core/guards/permission.guard';
import { Permission } from 'src/app/shared/constants/permissions';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';

const routes: Routes = [
  {
    path: '',
    component: UserManagementComponent,
    canActivate: [AutenticacionGuard, PermissionGuard],
    data: {
      permissions: [Permission.USER_READ]
    }
  },
  {
    path: ':uuidUser',
    component: UserDetailComponent,
    canActivate: [AutenticacionGuard, PermissionGuard],
    data: {
      permissions: [Permission.USER_READ]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule {}
