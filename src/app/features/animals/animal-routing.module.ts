import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from 'src/app/core/guards/autentication.guard';
import { PermissionGuard } from 'src/app/core/guards/permission.guard';
import { Permission } from 'src/app/shared/constants/permissions';
import { AnimalComponent } from './pages/animal/animal.component';

const routes: Routes = [
  {
    path: '',
    component: AnimalComponent,
    canActivate: [AutenticacionGuard, PermissionGuard],
    data: { permissions: [Permission.ANIMAL_READ] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnimalRoutingModule {}
