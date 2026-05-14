import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiItemResponse } from 'src/app/features/users/models/user-management.model';
import { RanchSummary } from 'src/app/features/companies/models/company-management.model';

@Injectable({
  providedIn: 'root'
})
export class RanchPageService {
  private readonly ranchUrl = `${environment.urlApi}/ranch`;

  constructor(private readonly http: HttpClient) {}

  getRanchById(uuidRanch: string): Observable<RanchSummary> {
    return this.http
      .get<ApiItemResponse<RanchSummary>>(`${this.ranchUrl}/${uuidRanch}`)
      .pipe(map((response) => response.data));
  }
}
