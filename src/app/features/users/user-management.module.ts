import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { UserCreateComponent } from './pages/user-create/user-create.component';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { UserManagementRoutingModule } from './user-management-routing.module';

@NgModule({
  declarations: [UserManagementComponent, UserDetailComponent, UserCreateComponent],
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, UserManagementRoutingModule]
})
export class UserManagementModule {}
