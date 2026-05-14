import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RanchManagementRoutingModule } from './ranch-management-routing.module';
import { RanchListComponent } from './pages/ranch-list/ranch-list.component';
import { RanchDetailComponent } from './pages/ranch-detail/ranch-detail.component';

@NgModule({
  declarations: [RanchListComponent, RanchDetailComponent],
  imports: [CommonModule, FormsModule, SharedModule, RanchManagementRoutingModule]
})
export class RanchManagementModule {}
