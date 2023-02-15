import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from './commons/autentication.guard';
import { HomeComponent } from './views/home/home.component';
import { LoginComponent } from './views/login/login/login.component';


const routes: Routes = [
  {path:'', component: LoginComponent},
  {path:'home', component: HomeComponent,canActivate: [AutenticacionGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
