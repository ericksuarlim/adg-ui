import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UserFieldAvailabilityResult {
  emailAvailable: boolean;
  usernameAvailable: boolean;
  idCardAvailable: boolean;
}

interface ApiItemResponse<T> {
  success: boolean;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class UserFieldAvailabilityService {
  private readonly userUrl = `${environment.urlApi}/user`;

  constructor(private readonly http: HttpClient) {}

  check(params: {
    uuid_company: string;
    exclude_uuid_user?: string;
    email?: string;
    username?: string;
    id_card?: string;
  }): Observable<UserFieldAvailabilityResult> {
    let httpParams = new HttpParams().set('uuid_company', params.uuid_company);
    if (params.exclude_uuid_user) {
      httpParams = httpParams.set('exclude_uuid_user', params.exclude_uuid_user);
    }
    if (params.email?.trim()) {
      httpParams = httpParams.set('email', params.email.trim());
    }
    if (params.username?.trim()) {
      httpParams = httpParams.set('username', params.username.trim());
    }
    if (params.id_card?.trim()) {
      httpParams = httpParams.set('id_card', params.id_card.trim());
    }

    return this.http
      .get<ApiItemResponse<UserFieldAvailabilityResult>>(`${this.userUrl}/availability`, { params: httpParams })
      .pipe(map((response) => response.data ?? { emailAvailable: true, usernameAvailable: true, idCardAvailable: true }));
  }
}
