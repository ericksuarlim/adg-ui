import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Cattle } from '../models/cattle.model';

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
}

@Injectable({
  providedIn: 'root'
})
export class CattleService {
  private readonly baseUrl: string = `${environment.urlApi}/cattle`;

  constructor(private readonly http: HttpClient) {}

  getCattle(): Observable<Cattle[]> {
    return this.http.get<PaginatedResponse<Cattle>>(this.baseUrl).pipe(
      map((response) => response.data ?? [])
    );
  }
}
