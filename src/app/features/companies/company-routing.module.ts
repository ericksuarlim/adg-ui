import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from 'src/app/core/guards/autentication.guard';
import { PermissionGuard } from 'src/app/core/guards/permission.guard';
import { Permission } from 'src/app/shared/constants/permissions';
import { CompanyActivationComponent } from './pages/company-activation/company-activation.component';
import { CompanyDetailComponent } from './pages/company-detail/company-detail.component';
import { SaasManagementComponent } from './pages/saas-management/saas-management.component';

const routes: Routes = [
  {
    path: '',
    component: SaasManagementComponent,
    canActivate: [AutenticacionGuard, PermissionGuard],
    data: {
      permissions: [Permission.COMPANY_READ]
    }
  },
  {
    path: ':uuidCompany/subscription',
    component: CompanyActivationComponent,
    canActivate: [AutenticacionGuard, PermissionGuard],
    data: {
      permissions: [Permission.COMPANY_WRITE]
    }
  },
  {
    path: ':uuidCompany',
    component: CompanyDetailComponent,
    canActivate: [AutenticacionGuard, PermissionGuard],
    data: {
      permissions: [Permission.COMPANY_READ]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule {}
