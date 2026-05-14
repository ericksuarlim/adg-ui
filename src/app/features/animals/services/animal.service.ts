import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AnimalListItem } from '../models/animal.model';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private readonly baseUrl: string = `${environment.urlApi}/animal`;

  constructor(private readonly http: HttpClient) {}

  getAnimals(): Observable<AnimalListItem[]> {
    return this.http.get<{ success: boolean; data: AnimalListItem[] }>(this.baseUrl).pipe(map((response) => response.data ?? []));
  }
}
