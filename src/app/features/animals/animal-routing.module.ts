import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from 'src/app/core/guards/autentication.guard';
import { PermissionGuard } from 'src/app/core/guards/permission.guard';
import { Permission } from 'src/app/shared/constants/permissions';
import { AnimalComponent } from './pages/animal/animal.component';
import { AnimalBatchRegisterComponent } from './pages/animal-batch-register/animal-batch-register.component';
import { AnimalRegisterIndividualComponent } from './pages/animal-register-individual/animal-register-individual.component';

const routes: Routes = [
  {
    path: '',
    component: AnimalComponent,
    canActivate: [AutenticacionGuard, PermissionGuard],
    data: {
      permissions: [Permission.ANIMAL_READ],
      breadcrumb: 'breadcrumbs.list'
    }
  },
  {
    path: 'register/individual',
    component: AnimalRegisterIndividualComponent,
    canActivate: [AutenticacionGuard, PermissionGuard],
    data: {
      permissions: [Permission.ANIMAL_WRITE],
      breadcrumb: 'breadcrumbs.animalIndividualRegister'
    }
  },
  {
    path: 'register/batch',
    component: AnimalBatchRegisterComponent,
    canActivate: [AutenticacionGuard, PermissionGuard],
    data: {
      permissions: [Permission.ANIMAL_WRITE],
      breadcrumb: 'breadcrumbs.animalBatchRegister'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnimalRoutingModule {}
