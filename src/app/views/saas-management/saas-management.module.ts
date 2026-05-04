import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SaasManagementRoutingModule } from './saas-management-routing.module';
import { SaasManagementComponent } from './saas-management.component';

@NgModule({
  declarations: [SaasManagementComponent],
  imports: [CommonModule, FormsModule, SaasManagementRoutingModule]
})
export class SaasManagementModule {}
