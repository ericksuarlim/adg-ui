import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from './pipes/translate.pipe';
import { UserFormComponent } from './components/forms/user-form/user-form.component';

@NgModule({
  declarations: [TranslatePipe, UserFormComponent],
  imports: [CommonModule, FormsModule],
  exports: [TranslatePipe, UserFormComponent]
})
export class SharedModule {}
