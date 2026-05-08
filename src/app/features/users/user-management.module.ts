import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { UserManagementRoutingModule } from './user-management-routing.module';

@NgModule({
  declarations: [UserManagementComponent, UserDetailComponent],
  imports: [CommonModule, FormsModule, SharedModule, UserManagementRoutingModule]
})
export class UserManagementModule {}
