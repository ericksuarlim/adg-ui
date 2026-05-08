import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompanyRoutingModule } from './company-routing.module';
import { CompanyActivationComponent } from './pages/company-activation/company-activation.component';
import { CompanyDetailComponent } from './pages/company-detail/company-detail.component';
import { SaasManagementComponent } from './pages/saas-management/saas-management.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [SaasManagementComponent, CompanyDetailComponent, CompanyActivationComponent],
  imports: [CommonModule, FormsModule, CompanyRoutingModule, SharedModule]
})
export class CompanyModule {}
