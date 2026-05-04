import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from 'src/app/commons/autentication.guard';
import { PermissionGuard } from 'src/app/commons/permission.guard';
import { Permission } from 'src/app/constants/permissions';
import { CattleComponent } from './cattle.component';

const routes: Routes = [
  {
    path: '',
    component: CattleComponent,
    canActivate: [AutenticacionGuard, PermissionGuard],
    data: { permissions: [Permission.CATTLE_READ] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CattleRoutingModule {}
