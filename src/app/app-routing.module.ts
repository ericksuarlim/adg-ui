import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from './core/guards/autentication.guard';
import { ShowLogin } from './core/guards/show-login.guard';
import { HomeComponent } from './features/home/pages/home/home.component';
import { LoginComponent } from './features/auth/pages/login/login.component';


const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'login', component: LoginComponent, canActivate: [ShowLogin] },
  { path: 'home', component: HomeComponent, canActivate: [AutenticacionGuard] },
  {
    path: 'animal',
    loadChildren: () => import('./features/animals/animal.module').then((m) => m.AnimalModule)
  },
  {
    path: 'saas-management',
    loadChildren: () =>
      import('./features/companies/company.module').then((m) => m.CompanyModule)
  },
  {
    path: 'user-management',
    loadChildren: () =>
      import('./features/users/user-management.module').then((m) => m.UserManagementModule)
  },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
