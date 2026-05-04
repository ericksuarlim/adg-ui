import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginRequest, LoginResponse, SessionData } from '../models/auth.model';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationServiceService {
  private readonly baseUrl: string = `${environment.urlApi}/session`;

  constructor(
    private readonly http: HttpClient,
    private readonly sessionService: SessionService
  ) { }

  logout(): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/logout`, {});
  }

  login(userData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, userData).pipe(
      tap((response) => {
        if (response.success && response.data) {
          const payload = this.decodeToken(response.data.token);
          const session: SessionData = {
            token: response.data.token,
            username: response.data.user.username,
            uuid_company: response.data.user.uuid_company,
            roles: payload?.roles ?? [],
            membership_status: payload?.membership_status,
            membership_renewal_at: payload?.membership_renewal_at ?? null
          };
          this.sessionService.setSession(session);
        }
      })
    );
  }

  requestNewPassword(userData: unknown): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/new-password`, userData);
  }

  resetPassword(userData: unknown): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/reset-password`, userData);
  }

  isAuthenticated(): boolean {
    return this.sessionService.isAuthenticated();
  }

  getUsername(): string | null {
    return this.sessionService.getUsername();
  }

  getRoles(): string[] {
    return this.sessionService.getRoles();
  }

  clearSession(): void {
    this.sessionService.clearSession();
  }

  private decodeToken(
    token: string
  ): { roles?: string[]; membership_status?: SessionData['membership_status']; membership_renewal_at?: string | null } | null {
    try {
      const [, payload] = token.split('.');
      return JSON.parse(atob(payload)) as { roles?: string[] };
    } catch {
      return null;
    }
  }
}
