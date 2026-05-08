import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AnimalRoutingModule } from './animal-routing.module';
import { AnimalComponent } from './pages/animal/animal.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [AnimalComponent],
  imports: [
    CommonModule,
    AnimalRoutingModule,
    SharedModule
  ]
})
export class AnimalModule {}
