import { Component, OnInit } from '@angular/core';
import { Animal } from '../../models/animal.model';
import { AnimalService } from '../../services/animal.service';

@Component({
  selector: 'app-animal',
  templateUrl: './animal.component.html',
  styleUrls: ['./animal.component.scss']
})
export class AnimalComponent implements OnInit {
  animals: Animal[] = [];
  searchTerm = '';
  selectedSex = 'ALL';
  page = 1;
  readonly pageSize = 10;

  constructor(private readonly animalService: AnimalService) {}

  ngOnInit(): void {
    this.animalService.getAnimals().subscribe({
      next: (animals) => {
        this.animals = animals;
      },
      error: () => {
        this.animals = [];
      }
    });
  }

  get filteredAnimals(): Animal[] {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();
    return this.animals.filter((animal) => {
      const matchesSex = this.selectedSex === 'ALL' || animal.sex === this.selectedSex;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        animal.primary_tag_number?.toLowerCase().includes(normalizedSearch) ||
        animal.secondary_tag_number?.toLowerCase().includes(normalizedSearch) ||
        animal.color?.toLowerCase().includes(normalizedSearch) ||
        animal.detail?.toLowerCase().includes(normalizedSearch);
      return matchesSex && matchesSearch;
    });
  }

  get paginatedAnimals(): Animal[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredAnimals.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    const pages = Math.ceil(this.filteredAnimals.length / this.pageSize);
    return pages > 0 ? pages : 1;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  updateSearch(term: string): void {
    this.searchTerm = term;
    this.page = 1;
  }

  updateSexFilter(value: string): void {
    this.selectedSex = value;
    this.page = 1;
  }

  goToPage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages) {
      return;
    }
    this.page = nextPage;
  }
}
