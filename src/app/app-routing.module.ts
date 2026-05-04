import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from './commons/autentication.guard';
import { ShowLogin } from './commons/showLogin';
import { HomeComponent } from './views/home/home.component';
import { LoginComponent } from './views/login/login/login.component';


const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'login', component: LoginComponent, canActivate: [ShowLogin] },
  { path: 'home', component: HomeComponent, canActivate: [AutenticacionGuard] },
  {
    path: 'cattle',
    loadChildren: () => import('./views/cattle/cattle.module').then((m) => m.CattleModule)
  },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
