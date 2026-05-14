import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from './pipes/translate.pipe';
import { UserFormComponent } from './components/forms/user-form/user-form.component';
import { RanchFormComponent } from './components/forms/ranch-form/ranch-form.component';
import { ConfirmDialogComponent } from './components/modals/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [TranslatePipe, UserFormComponent, RanchFormComponent, ConfirmDialogComponent],
  imports: [CommonModule, FormsModule],
  exports: [TranslatePipe, UserFormComponent, RanchFormComponent, ConfirmDialogComponent]
})
export class SharedModule {}
