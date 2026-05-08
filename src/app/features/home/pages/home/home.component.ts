import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(
    private readonly router: Router,
  ) { }

  openAnimalTable(): void {
    this.router.navigate(['/animal']);
  }

  openAnimalTableFromKeyboard(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openAnimalTable();
    }
  }
}
