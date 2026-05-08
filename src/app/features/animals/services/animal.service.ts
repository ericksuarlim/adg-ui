import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Animal } from '../models/animal.model';

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
}

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private readonly baseUrl: string = `${environment.urlApi}/animal`;

  constructor(private readonly http: HttpClient) {}

  getAnimals(): Observable<Animal[]> {
    return this.http.get<PaginatedResponse<Animal>>(this.baseUrl).pipe(
      map((response) => response.data ?? [])
    );
  }
}
