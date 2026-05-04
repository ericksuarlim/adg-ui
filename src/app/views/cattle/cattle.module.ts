import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CattleRoutingModule } from './cattle-routing.module';
import { CattleComponent } from './cattle.component';

@NgModule({
  declarations: [CattleComponent],
  imports: [
    CommonModule,
    CattleRoutingModule
  ]
})
export class CattleModule {}
